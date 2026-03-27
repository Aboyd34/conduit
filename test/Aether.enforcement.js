/**
 * Aether (AETH) — Enforcement Test Suite
 * Run: npx hardhat test test/Aether.enforcement.js
 */

const { expect } = require('chai')
const { ethers }  = require('hardhat')
const { MerkleTree } = require('merkletreejs')
const keccak256 = require('keccak256')

describe('Aether — Enforcement Tests', function () {
  let aether, owner, team, liquidity, treasury, ecosystem, user1, user2

  const TOTAL_SUPPLY     = ethers.parseEther('1000000000')
  const AIRDROP_SUPPLY   = ethers.parseEther('500000000')
  const TEAM_SUPPLY      = ethers.parseEther('150000000')
  const GATE_THRESHOLD   = ethers.parseEther('100')
  const RECYCLE_COST     = ethers.parseEther('10')

  beforeEach(async () => {
    ;[owner, team, liquidity, treasury, ecosystem, user1, user2] = await ethers.getSigners()
    const Factory = await ethers.getContractFactory('Aether')
    aether = await Factory.deploy(
      team.address,
      liquidity.address,
      treasury.address,
      ecosystem.address
    )
    await aether.waitForDeployment()
  })

  // ─────────────────────────────────────────────
  // 1. Supply integrity
  // ─────────────────────────────────────────────
  describe('Supply integrity', () => {
    it('Total supply equals 1,000,000,000 AETH', async () => {
      expect(await aether.totalSupply()).to.equal(TOTAL_SUPPLY)
    })

    it('Contract holds airdrop + team tokens', async () => {
      const addr  = await aether.getAddress()
      const held  = await aether.balanceOf(addr)
      expect(held).to.equal(AIRDROP_SUPPLY + TEAM_SUPPLY)
    })

    it('Ecosystem, liquidity, treasury wallets receive correct amounts', async () => {
      expect(await aether.balanceOf(ecosystem.address)).to.equal(ethers.parseEther('200000000'))
      expect(await aether.balanceOf(liquidity.address)).to.equal(ethers.parseEther('100000000'))
      expect(await aether.balanceOf(treasury.address)).to.equal(ethers.parseEther('50000000'))
    })
  })

  // ─────────────────────────────────────────────
  // 2. Airdrop enforcement
  // ─────────────────────────────────────────────
  describe('Airdrop enforcement', () => {
    let tree, proof, claimAmount

    beforeEach(async () => {
      claimAmount = ethers.parseEther('1000')
      const leaf  = keccak256(
        keccak256(
          Buffer.concat([
            Buffer.from(user1.address.slice(2), 'hex'),
            Buffer.from(claimAmount.toString(16).padStart(64, '0'), 'hex')
          ])
        )
      )
      tree = new MerkleTree([leaf], keccak256, { sortPairs: true })
      proof = tree.getHexProof(leaf)

      await aether.connect(owner).setMerkleRoot(tree.getHexRoot())
      await aether.connect(owner).setAirdropOpen(true)
    })

    it('Valid claim succeeds', async () => {
      await expect(
        aether.connect(user1).claimAirdrop(claimAmount, proof)
      ).to.emit(aether, 'AirdropClaimed').withArgs(user1.address, claimAmount)
      expect(await aether.balanceOf(user1.address)).to.equal(claimAmount)
      expect(await aether.hasClaimed(user1.address)).to.be.true
    })

    it('Cannot claim twice', async () => {
      await aether.connect(user1).claimAirdrop(claimAmount, proof)
      await expect(
        aether.connect(user1).claimAirdrop(claimAmount, proof)
      ).to.be.revertedWith('Already claimed')
    })

    it('Invalid proof is rejected', async () => {
      await expect(
        aether.connect(user2).claimAirdrop(claimAmount, proof)
      ).to.be.revertedWith('Invalid proof')
    })

    it('Cannot claim when airdrop is closed', async () => {
      await aether.connect(owner).setAirdropOpen(false)
      await expect(
        aether.connect(user1).claimAirdrop(claimAmount, proof)
      ).to.be.revertedWith('Airdrop not open')
    })

    it('Only owner can set merkle root', async () => {
      await expect(
        aether.connect(user1).setMerkleRoot(tree.getHexRoot())
      ).to.be.reverted
    })

    it('Only owner can toggle airdrop open', async () => {
      await expect(
        aether.connect(user1).setAirdropOpen(false)
      ).to.be.reverted
    })
  })

  // ─────────────────────────────────────────────
  // 3. Recycle mechanic
  // ─────────────────────────────────────────────
  describe('Recycle enforcement', () => {
    beforeEach(async () => {
      // Give user1 some AETH to test recycle
      await aether.connect(ecosystem).transfer(user1.address, ethers.parseEther('100'))
    })

    it('Recycle burns 10 AETH and emits event', async () => {
      const before = await aether.totalSupply()
      await expect(
        aether.connect(user1).recycle('post-001')
      ).to.emit(aether, 'Recycled').withArgs(user1.address, 'post-001', RECYCLE_COST)
      expect(await aether.totalSupply()).to.equal(before - RECYCLE_COST)
    })

    it('Recycle fails if insufficient balance', async () => {
      await expect(
        aether.connect(user2).recycle('post-001')
      ).to.be.reverted
    })
  })

  // ─────────────────────────────────────────────
  // 4. Token gate
  // ─────────────────────────────────────────────
  describe('Token gate', () => {
    it('Returns false when balance < 100 AETH', async () => {
      expect(await aether.isGated(user1.address)).to.be.false
    })

    it('Returns true when balance >= 100 AETH', async () => {
      await aether.connect(ecosystem).transfer(user1.address, GATE_THRESHOLD)
      expect(await aether.isGated(user1.address)).to.be.true
    })
  })

  // ─────────────────────────────────────────────
  // 5. Team vesting enforcement
  // ─────────────────────────────────────────────
  describe('Team vesting enforcement', () => {
    it('Cannot release before 6-month cliff', async () => {
      await expect(
        aether.releaseTeamVesting()
      ).to.be.revertedWith('Cliff not reached')
    })

    it('Can release after cliff — tokens go to teamWallet', async () => {
      // Fast-forward 181 days
      await ethers.provider.send('evm_increaseTime', [181 * 24 * 60 * 60])
      await ethers.provider.send('evm_mine')

      const before = await aether.balanceOf(team.address)
      await aether.releaseTeamVesting()
      const after  = await aether.balanceOf(team.address)
      expect(after).to.be.gt(before)
    })

    it('Nothing to release if called twice in same block', async () => {
      await ethers.provider.send('evm_increaseTime', [181 * 24 * 60 * 60])
      await ethers.provider.send('evm_mine')
      await aether.releaseTeamVesting()
      await expect(
        aether.releaseTeamVesting()
      ).to.be.revertedWith('Nothing to release')
    })

    it('teamReleasable() returns 0 before cliff', async () => {
      expect(await aether.teamReleasable()).to.equal(0)
    })
  })

  // ─────────────────────────────────────────────
  // 6. Rescue airdrop remainder
  // ─────────────────────────────────────────────
  describe('Rescue enforcement', () => {
    it('Owner cannot rescue before 2 years', async () => {
      await expect(
        aether.connect(owner).rescueAirdropRemainder(owner.address)
      ).to.be.revertedWith('Too early (2 year lock)')
    })

    it('Non-owner cannot rescue ever', async () => {
      await expect(
        aether.connect(user1).rescueAirdropRemainder(user1.address)
      ).to.be.reverted
    })
  })
})
