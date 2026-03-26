/**
 * Sets the Merkle root on the deployed Aether contract
 * Run AFTER airdrop-snapshot.js has generated airdrop-snapshot.json
 *
 * Usage: npx hardhat run scripts/set-merkle-root.js --network sepolia
 *
 * Env vars:
 *   AETHER_CONTRACT_ADDRESS — from deploy step
 *   PRIVATE_KEY
 *   SEPOLIA_RPC_URL
 */

const { ethers } = require('hardhat')
const fs = require('fs')
const path = require('path')

async function main() {
  const snapshotPath = path.join(__dirname, '..', 'airdrop-snapshot.json')
  if (!fs.existsSync(snapshotPath)) {
    throw new Error('airdrop-snapshot.json not found. Run airdrop-snapshot.js first.')
  }

  const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'))
  const { merkleRoot } = snapshot

  const contractAddress = process.env.AETHER_CONTRACT_ADDRESS
  if (!contractAddress) throw new Error('Set AETHER_CONTRACT_ADDRESS in .env')

  const [owner] = await ethers.getSigners()
  const Aether = await ethers.getContractFactory('Aether')
  const aether = Aether.attach(contractAddress)

  console.log('Setting Merkle root...')
  console.log('  Contract:', contractAddress)
  console.log('  Root:', merkleRoot)
  console.log('  Recipients:', snapshot.totalRecipients)

  const tx = await aether.setMerkleRoot(merkleRoot)
  await tx.wait()
  console.log('✅ Merkle root set. Tx:', tx.hash)

  const tx2 = await aether.setAirdropOpen(true)
  await tx2.wait()
  console.log('✅ Airdrop opened. Tx:', tx2.hash)
}

main().catch(err => {
  console.error(err)
  process.exitCode = 1
})
