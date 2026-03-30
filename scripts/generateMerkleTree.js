const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

async function main() {
  const claims = [
    // Replace these with your real recipients and amounts
    // amount must be in wei
    { account: "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4", amount: "1000000000000000000000" },
    { account: "0xYourSecondAddressHere000000000000000000000", amount: "2000000000000000000000" },
  ];

  const leaves = claims.map((c, index) =>
    ethers.solidityPackedKeccak256(
      ["uint256", "address", "uint256"],
      [index, c.account, c.amount]
    )
  );

  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  const merkleRoot = tree.getHexRoot();

  const claimsWithProofs = claims.map((c, index) => {
    const leaf = ethers.solidityPackedKeccak256(
      ["uint256", "address", "uint256"],
      [index, c.account, c.amount]
    );
    return {
      index,
      account: c.account,
      amount: c.amount,
      proof: tree.getHexProof(leaf),
    };
  });

  const outDir = path.join(__dirname, "..", "output");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(
    path.join(outDir, "merkleData.json"),
    JSON.stringify({ merkleRoot, claims: claimsWithProofs }, null, 2)
  );

  console.log("Merkle Root:", merkleRoot);
  console.log("Saved to output/merkleData.json");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});