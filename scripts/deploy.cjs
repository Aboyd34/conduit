const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  const Token = await hre.ethers.getContractFactory("ConduitToken");
  const token = await Token.deploy(deployer.address);
  await token.waitForDeployment();

  const address = await token.getAddress();
  console.log("ConduitToken deployed to:", address);
  console.log("Copy this address into thirdweb Import Token on Base Sepolia!");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
