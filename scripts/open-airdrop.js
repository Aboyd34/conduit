/**
 * Open (or close) the airdrop on a deployed Aether contract
 *
 * Usage:
 *   npx hardhat run scripts/open-airdrop.js --network base-sepolia       # opens
 *   CLOSE=1 npx hardhat run scripts/open-airdrop.js --network base-sepolia  # closes
 *
 * Reads contract address from aether-deployment.json
 */

const hre  = require('hardhat');
const fs   = require('fs');
const path = require('path');
require('dotenv').config();

async function main() {
  const deploymentPath = path.join(__dirname, '..', 'aether-deployment.json');
  if (!fs.existsSync(deploymentPath)) throw new Error('aether-deployment.json not found.');

  const { address: contractAddress } = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  const open = !process.env.CLOSE;

  console.log(`${open ? 'Opening' : 'Closing'} airdrop on ${contractAddress} (${hre.network.name})...`);

  const Aether = await hre.ethers.getContractFactory('Aether');
  const aether = Aether.attach(contractAddress);

  const tx = await aether.setAirdropOpen(open);
  process.stdout.write('  Waiting for confirmation...');
  await tx.wait();
  console.log(' done');
  console.log(`\n✅ Airdrop is now ${open ? 'OPEN' : 'CLOSED'}. Tx: ${tx.hash}`);
}

main().catch((e) => { console.error('❌', e.message); process.exit(1); });
