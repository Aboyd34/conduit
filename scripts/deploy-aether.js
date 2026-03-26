/**
 * Hardhat deploy script — Aether (AETH) token on Sepolia testnet
 *
 * Usage:
 *   npx hardhat run scripts/deploy-aether.js --network sepolia
 *
 * Env vars required in .env:
 *   PRIVATE_KEY         — deployer wallet private key (no 0x prefix)
 *   SEPOLIA_RPC_URL     — e.g. https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
 *   ETHERSCAN_API_KEY   — for auto-verification (optional)
 */

const { ethers } = require('hardhat')

async function main() {
  const [deployer] = await ethers.getSigners()
  console.log('Deploying with account:', deployer.address)

  const balance = await deployer.provider.getBalance(deployer.address)
  console.log('Account balance:', ethers.formatEther(balance), 'ETH')

  // ── Wallet config ────────────────────────────────────────────────────────
  // In production replace these with real multi-sig / gnosis safe addresses
  const TEAM_WALLET      = deployer.address  // replace before mainnet
  const LIQUIDITY_WALLET = deployer.address  // replace before mainnet
  const TREASURY_WALLET  = deployer.address  // replace before mainnet
  const ECOSYSTEM_WALLET = deployer.address  // replace before mainnet

  console.log('\nDeploying Aether (AETH)...')
  const Aether = await ethers.getContractFactory('Aether')
  const aether = await Aether.deploy(
    TEAM_WALLET,
    LIQUIDITY_WALLET,
    TREASURY_WALLET,
    ECOSYSTEM_WALLET
  )

  await aether.waitForDeployment()
  const address = await aether.getAddress()

  console.log('\n✅ Aether deployed to:', address)
  console.log('   Network: Sepolia')
  console.log('   Total supply: 1,000,000,000 AETH')
  console.log('   Airdrop pool: 500,000,000 AETH (held in contract)')
  console.log('   Team vesting: 150,000,000 AETH (6mo cliff, 2yr vest)')
  console.log('')
  console.log('Next steps:')
  console.log('  1. Save contract address in .env as AETHER_CONTRACT_ADDRESS')
  console.log('  2. Run the airdrop snapshot: node scripts/airdrop-snapshot.js')
  console.log('  3. Set merkle root: npx hardhat run scripts/set-merkle-root.js --network sepolia')
  console.log('  4. Open airdrop: call setAirdropOpen(true) via Etherscan or script')
  console.log('')
  console.log('Verify on Etherscan:')
  console.log(`  npx hardhat verify --network sepolia ${address} "${TEAM_WALLET}" "${LIQUIDITY_WALLET}" "${TREASURY_WALLET}" "${ECOSYSTEM_WALLET}"`)
}

main().catch(err => {
  console.error(err)
  process.exitCode = 1
})
