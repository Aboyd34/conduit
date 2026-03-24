/**
 * Set Merkle root on a deployed Aether contract
 *
 * Usage:
 *   MERKLE_ROOT=0x<root> npx hardhat run scripts/set-merkle-root.js --network base-sepolia
 *
 * Reads contract address from aether-deployment.json (written by deploy-aether.js)
 */

const hre = require('hardhat');
const fs  = require('fs');
const path = require('path');
require('dotenv').config();

async function main() {
  const deploymentPath = path.join(__dirname, '..', 'aether-deployment.json');
  if (!fs.existsSync(deploymentPath)) throw new Error('aether-deployment.json not found. Run deploy-aether.js first.');

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  const contractAddress = deployment.address;
  const merkleRoot = process.env.MERKLE_ROOT;

  if (!merkleRoot) throw new Error('Set MERKLE_ROOT=0x<root> in your env before running this script.');
  if (!/^0x[0-9a-f]{64}$/i.test(merkleRoot)) throw new Error('MERKLE_ROOT must be a 32-byte hex string (0x + 64 hex chars).');

  console.log(`Setting Merkle root on ${contractAddress} (${hre.network.name})...`);
  console.log(`Root: ${merkleRoot}`);

  const Aether = await hre.ethers.getContractFactory('Aether');
  const aether = Aether.attach(contractAddress);

  const tx = await aether.setMerkleRoot(merkleRoot);
  process.stdout.write('  Waiting for confirmation...');
  await tx.wait();
  console.log(' done');
  console.log(`\n✅ Merkle root set. Tx: ${tx.hash}`);
  console.log('  Run open-airdrop.js when ready to let users claim.');
}

main().catch((e) => { console.error('❌', e.message); process.exit(1); });
