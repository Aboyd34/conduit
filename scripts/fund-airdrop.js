/**
 * Fund the airdrop contract with AETH tokens
 * Usage: npx hardhat run scripts/fund-airdrop.js --network sepolia
 *
 * Set in .env:
 *   AETHER_CONTRACT_ADDRESS=0x...
 *   FUND_AMOUNT_AETH=10000        (how many AETH to send, default 10000)
 */

const { ethers } = require('hardhat')
require('dotenv').config()

async function main() {
  const contractAddress = process.env.AETHER_CONTRACT_ADDRESS
  if (!contractAddress) throw new Error('Set AETHER_CONTRACT_ADDRESS in .env')

  const amount = process.env.FUND_AMOUNT_AETH || '10000'
  const wei    = ethers.parseEther(amount)

  const [deployer] = await ethers.getSigners()
  console.log('Funder:', deployer.address)
  console.log('Contract:', contractAddress)
  console.log('Amount:', amount, 'AETH')

  const abi = [
    'function transfer(address to, uint256 amount) returns (bool)',
    'function balanceOf(address) view returns (uint256)',
  ]

  const token = new ethers.Contract(contractAddress, abi, deployer)

  const balance = await token.balanceOf(deployer.address)
  console.log('Your balance:', ethers.formatEther(balance), 'AETH')

  if (balance < wei) throw new Error('Insufficient AETH balance to fund.')

  const tx = await token.transfer(contractAddress, wei)
  await tx.wait()
  console.log('✅ Funded contract with', amount, 'AETH')
  console.log('   Tx:', tx.hash)
}

main().catch(e => { console.error(e); process.exit(1) })
