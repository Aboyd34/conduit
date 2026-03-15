/**
 * Deploy Aether (AETH) to Base or Base Sepolia
 *
 * Usage:
 *   npx hardhat run scripts/deploy-aether.js --network base-sepolia
 *   npx hardhat run scripts/deploy-aether.js --network base
 *
 * Set env vars before running:
 *   TEAM_WALLET      = 0x...
 *   LIQUIDITY_WALLET = 0x...
 *   TREASURY_WALLET  = 0x...
 *   ECOSYSTEM_WALLET = 0x...
 *   DEPLOYER_KEY     = 0x... (private key, never commit)
 */

const hre = require('hardhat');

async function main() {
  const {
    TEAM_WALLET,
    LIQUIDITY_WALLET,
    TREASURY_WALLET,
    ECOSYSTEM_WALLET,
  } = process.env;

  if (!TEAM_WALLET || !LIQUIDITY_WALLET || !TREASURY_WALLET || !ECOSYSTEM_WALLET) {
    throw new Error(
      'Set TEAM_WALLET, LIQUIDITY_WALLET, TREASURY_WALLET, ECOSYSTEM_WALLET env vars'
    );
  }

  console.log('Deploying Aether (AETH) to', hre.network.name, '...');

  const Aether = await hre.ethers.getContractFactory('Aether');
  const aether = await Aether.deploy(
    TEAM_WALLET,
    LIQUIDITY_WALLET,
    TREASURY_WALLET,
    ECOSYSTEM_WALLET
  );

  await aether.waitForDeployment();
  const address = await aether.getAddress();

  console.log('\n✅ Aether deployed!');
  console.log('   Contract address:', address);
  console.log('   Network:         ', hre.network.name);
  console.log('   Team wallet:     ', TEAM_WALLET);
  console.log('\nNext steps:');
  console.log('  1. Verify: npx hardhat verify --network', hre.network.name, address,
    TEAM_WALLET, LIQUIDITY_WALLET, TREASURY_WALLET, ECOSYSTEM_WALLET);
  console.log('  2. Run airdrop snapshot: node scripts/airdrop-snapshot.js');
  console.log('  3. Set Merkle root: call setMerkleRoot() with the root from snapshot');
  console.log('  4. Open airdrop: call setAirdropOpen(true)');
  console.log('  5. Update VITE_AETHER_ADDRESS in .env');

  // Write address to a local file for easy reference
  const fs = require('fs');
  fs.writeFileSync(
    'aether-deployment.json',
    JSON.stringify({ address, network: hre.network.name, deployedAt: new Date().toISOString() }, null, 2)
  );
  console.log('\n   Saved to aether-deployment.json');
}

main().catch((e) => { console.error(e); process.exit(1); });
