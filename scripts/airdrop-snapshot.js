/**
 * Airdrop snapshot generator
 * Reads conduit activity data and generates a Merkle tree + proof file
 *
 * Usage: node scripts/airdrop-snapshot.js
 * Output: airdrop-snapshot.json  (merkleRoot + recipients array with proofs)
 *
 * Install deps: npm install @openzeppelin/merkle-tree
 */

const { StandardMerkleTree } = require('@openzeppelin/merkle-tree')
const fs = require('fs')
const path = require('path')

// ── EDIT THIS: your activity-based allocations ───────────────────────────
// Format: [walletAddress, aethAmountInWei]
const ALLOCATIONS = [
  // Example entries — replace with real data from your DB
  // ['0xWALLET_ADDRESS', ethers.parseEther('1200').toString()],
]

if (ALLOCATIONS.length === 0) {
  console.error('⚠️  No allocations defined in ALLOCATIONS array.')
  console.error('   Add wallet addresses + AETH amounts before running.')
  process.exit(1)
}

console.log(`Building Merkle tree for ${ALLOCATIONS.length} recipients...`)

const tree = StandardMerkleTree.of(
  ALLOCATIONS.map(([addr, amount]) => [addr, amount]),
  ['address', 'uint256']
)

const snapshot = {
  merkleRoot: tree.root,
  totalRecipients: ALLOCATIONS.length,
  generatedAt: new Date().toISOString(),
  recipients: ALLOCATIONS.map(([address, amount], i) => ({
    address,
    amount,
    proof: tree.getProof(i),
  }))
}

const outPath = path.join(__dirname, '..', 'airdrop-snapshot.json')
fs.writeFileSync(outPath, JSON.stringify(snapshot, null, 2))

console.log('✅ Snapshot written to airdrop-snapshot.json')
console.log('   Merkle root:', tree.root)
console.log('   Recipients:', ALLOCATIONS.length)
console.log('')
console.log('Next: set this root on-chain with scripts/set-merkle-root.js')
