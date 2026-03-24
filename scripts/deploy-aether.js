/**
 * Deploy Aether (AETH) to Base Sepolia or Base Mainnet
 *
 * Usage:
 *   npx hardhat run scripts/deploy-aether.js --network base-sepolia
 *   npx hardhat run scripts/deploy-aether.js --network base
 *
 * Required .env vars:
 *   DEPLOYER_KEY       = 0x<private key>   (NEVER commit this)
 *   TEAM_WALLET        = 0x...
 *   LIQUIDITY_WALLET   = 0x...
 *   TREASURY_WALLET    = 0x...
 *   ECOSYSTEM_WALLET   = 0x...
 *
 * Optional:
 *   BASESCAN_API_KEY   = for auto-verification
 *   MERKLE_ROOT        = 0x<root>  if you want to set it during deploy
 */

const hre   = require('hardhat');
const fs    = require('fs');
const path  = require('path');
require('dotenv').config();

// ─── Helpers ────────────────────────────────────────────────────────────────

function requireEnv(name) {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required env var: ${name}`);
  return val;
}

function isAddress(str) {
  return /^0x[0-9a-fA-F]{40}$/.test(str);
}

function validateWallets(wallets) {
  for (const [name, addr] of Object.entries(wallets)) {
    if (!isAddress(addr)) throw new Error(`${name} is not a valid address: "${addr}"`);
  }
}

async function waitWithSpinner(promise, label) {
  process.stdout.write(`  ⏳ ${label}...`);
  const result = await promise;
  process.stdout.write(' done\n');
  return result;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const network = hre.network.name;
  const isTestnet = network === 'base-sepolia';

  console.log('\n╔══════════════════════════════════════╗');
  console.log(`║   Aether (AETH) Deployment            ║`);
  console.log(`║   Network: ${network.padEnd(26)}║`);
  console.log('╚══════════════════════════════════════╝\n');

  // ── Validate env ──────────────────────────────────────────────────────────
  const wallets = {
    TEAM_WALLET:        requireEnv('TEAM_WALLET'),
    LIQUIDITY_WALLET:   requireEnv('LIQUIDITY_WALLET'),
    TREASURY_WALLET:    requireEnv('TREASURY_WALLET'),
    ECOSYSTEM_WALLET:   requireEnv('ECOSYSTEM_WALLET'),
  };
  validateWallets(wallets);

  // ── Deployer info ─────────────────────────────────────────────────────────
  const [deployer] = await hre.ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  const balance = await hre.ethers.provider.getBalance(deployerAddress);
  const balanceETH = hre.ethers.formatEther(balance);

  console.log(`  Deployer:  ${deployerAddress}`);
  console.log(`  Balance:   ${balanceETH} ETH`);

  if (parseFloat(balanceETH) < 0.005 && !isTestnet) {
    throw new Error(`Deployer balance too low (${balanceETH} ETH). Need at least 0.005 ETH for gas.`);
  }
  if (parseFloat(balanceETH) === 0) {
    throw new Error('Deployer has 0 ETH. Get testnet ETH from https://www.coinbase.com/faucets/base-ethereum-goerli-faucet');
  }

  console.log('\n  Allocation wallets:');
  for (const [k, v] of Object.entries(wallets)) console.log(`    ${k}: ${v}`);

  // ── Estimate gas ─────────────────────────────────────────────────────────
  const Aether = await hre.ethers.getContractFactory('Aether');
  let estimatedGas;
  try {
    estimatedGas = await hre.ethers.provider.estimateGas(
      await Aether.getDeployTransaction(
        wallets.TEAM_WALLET,
        wallets.LIQUIDITY_WALLET,
        wallets.TREASURY_WALLET,
        wallets.ECOSYSTEM_WALLET,
      )
    );
    console.log(`\n  Estimated gas: ${estimatedGas.toLocaleString()} units`);
  } catch {
    console.warn('  Could not estimate gas — proceeding anyway.');
  }

  // ── Deploy ────────────────────────────────────────────────────────────────
  console.log('\n  Deploying contract...');
  const aether = await waitWithSpinner(
    Aether.deploy(
      wallets.TEAM_WALLET,
      wallets.LIQUIDITY_WALLET,
      wallets.TREASURY_WALLET,
      wallets.ECOSYSTEM_WALLET,
    ),
    'Sending deploy transaction'
  );

  await waitWithSpinner(
    aether.waitForDeployment(),
    'Waiting for confirmation'
  );

  const contractAddress = await aether.getAddress();
  const deployTx = aether.deploymentTransaction();

  console.log('\n✅ Contract deployed successfully!');
  console.log(`   Address:  ${contractAddress}`);
  console.log(`   Tx hash:  ${deployTx?.hash}`);
  const explorer = isTestnet
    ? `https://sepolia.basescan.org/address/${contractAddress}`
    : `https://basescan.org/address/${contractAddress}`;
  console.log(`   Explorer: ${explorer}`);

  // ── Optional: set Merkle root immediately ─────────────────────────────────
  if (process.env.MERKLE_ROOT) {
    console.log('\n  Setting Merkle root from env...');
    const tx = await aether.setMerkleRoot(process.env.MERKLE_ROOT);
    await waitWithSpinner(tx.wait(), 'Waiting for setMerkleRoot tx');
    console.log(`  ✅ Merkle root set: ${process.env.MERKLE_ROOT}`);
    console.log('  Run aether.setAirdropOpen(true) when you are ready to open claims.');
  }

  // ── Save deployment record ────────────────────────────────────────────────
  const record = {
    address:     contractAddress,
    network,
    chainId:     hre.network.config.chainId,
    txHash:      deployTx?.hash,
    deployer:    deployerAddress,
    deployedAt:  new Date().toISOString(),
    wallets,
    merkleRoot:  process.env.MERKLE_ROOT || null,
    explorer,
  };

  const outFile = path.join(__dirname, '..', 'aether-deployment.json');
  fs.writeFileSync(outFile, JSON.stringify(record, null, 2));
  console.log(`\n  Saved deployment record → aether-deployment.json`);

  // ── Post-deploy checklist ─────────────────────────────────────────────────
  console.log('\n─────────────────────────────────────────────────');
  console.log('POST-DEPLOY CHECKLIST:');
  console.log(`  1. Add to .env (and Vercel env vars):`);
  console.log(`     VITE_AETHER_ADDRESS=${contractAddress}`);
  if (!process.env.MERKLE_ROOT) {
    console.log('  2. Generate snapshot: node scripts/airdrop-snapshot.js');
    console.log('  3. Set Merkle root:   npx hardhat run scripts/set-merkle-root.js --network', network);
  }
  console.log('  4. Open airdrop:      npx hardhat run scripts/open-airdrop.js --network', network);
  console.log(`  5. Verify contract:   npx hardhat verify --network ${network} ${contractAddress} \\`);
  console.log(`       ${wallets.TEAM_WALLET} ${wallets.LIQUIDITY_WALLET} \\`);
  console.log(`       ${wallets.TREASURY_WALLET} ${wallets.ECOSYSTEM_WALLET}`);
  console.log('─────────────────────────────────────────────────\n');
}

main().catch((e) => { console.error('\n❌ Deploy failed:', e.message); process.exit(1); });
