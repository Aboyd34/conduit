/**
 * deploy-mainnet.js
 * Deploys ConduitToken (CDT), Aether (AETH), and MerkleAirdrop to Base Mainnet.
 *
 * Usage:
 *   npx hardhat run scripts/deploy-mainnet.js --network base
 *
 * Required .env vars:
 *   PRIVATE_KEY          -- deployer wallet private key (no 0x prefix)
 *   BASE_MAINNET_RPC     -- Base mainnet RPC (Alchemy/QuickNode)
 *   TEAM_WALLET          -- address for team vesting
 *   LIQUIDITY_WALLET     -- address for liquidity allocation
 *   TREASURY_WALLET      -- address for treasury allocation
 *   ECOSYSTEM_WALLET     -- address for ecosystem/platform rewards
 *   MERKLE_ROOT          -- bytes32 root from airdrop-snapshot output
 *                           (use ethers.ZeroHash to set later)
 */

const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("ETH Balance:", ethers.formatEther(balance), "ETH");
  if (balance < ethers.parseEther("0.01")) {
    throw new Error("Insufficient ETH. Fund deployer with at least 0.01 ETH on Base mainnet.");
  }

  const teamWallet      = process.env.TEAM_WALLET;
  const liquidityWallet = process.env.LIQUIDITY_WALLET;
  const treasuryWallet  = process.env.TREASURY_WALLET;
  const ecosystemWallet = process.env.ECOSYSTEM_WALLET;
  const merkleRoot      = process.env.MERKLE_ROOT || ethers.ZeroHash;

  if (!teamWallet || !liquidityWallet || !treasuryWallet || !ecosystemWallet) {
    throw new Error("Missing wallet env vars. Set TEAM_WALLET, LIQUIDITY_WALLET, TREASURY_WALLET, ECOSYSTEM_WALLET in .env");
  }

  // --- 1. Deploy ConduitToken (CDT) ---
  console.log("\n[1/3] Deploying ConduitToken (CDT)...");
  const CDT = await ethers.getContractFactory("ConduitToken");
  const cdt = await CDT.deploy(deployer.address);
  await cdt.waitForDeployment();
  const cdtAddress = await cdt.getAddress();
  console.log("CDT deployed:", cdtAddress);

  // --- 2. Deploy Aether (AETH) ---
  console.log("\n[2/3] Deploying Aether (AETH)...");
  const Aether = await ethers.getContractFactory("Aether");
  const aether = await Aether.deploy(teamWallet, liquidityWallet, treasuryWallet, ecosystemWallet);
  await aether.waitForDeployment();
  const aetherAddress = await aether.getAddress();
  console.log("AETH deployed:", aetherAddress);

  // --- 3. Deploy MerkleAirdrop ---
  console.log("\n[3/3] Deploying MerkleAirdrop...");
  const MerkleAirdrop = await ethers.getContractFactory("MerkleAirdrop");
  const merkleAirdrop = await MerkleAirdrop.deploy(aetherAddress, merkleRoot);
  await merkleAirdrop.waitForDeployment();
  const merkleAirdropAddress = await merkleAirdrop.getAddress();
  console.log("MerkleAirdrop deployed:", merkleAirdropAddress);

  // --- Summary ---
  console.log("\n===========================================");
  console.log(" DEPLOYMENT COMPLETE -- BASE MAINNET");
  console.log("===========================================");
  console.log(" CDT (ConduitToken):", cdtAddress);
  console.log(" AETH (Aether):     ", aetherAddress);
  console.log(" MerkleAirdrop:     ", merkleAirdropAddress);
  console.log("===========================================");
  console.log("\nNext steps:");
  console.log(" 1. Update .env.production with addresses above");
  console.log(" 2. Run: node scripts/airdrop-snapshot.js");
  console.log(" 3. Set merkle root: node scripts/set-merkle-root.js");
  console.log(" 4. Open airdrop: call setAirdropOpen(true) on Aether");
  console.log(" 5. Verify on Basescan:");
  console.log(`    npx hardhat verify --network base ${cdtAddress} "${deployer.address}"`);
  console.log(`    npx hardhat verify --network base ${aetherAddress} "${teamWallet}" "${liquidityWallet}" "${treasuryWallet}" "${ecosystemWallet}"`);
  console.log(`    npx hardhat verify --network base ${merkleAirdropAddress} "${aetherAddress}" "${merkleRoot}"`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
