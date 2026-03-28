// MerkleAirdrop contract ABI — generated from MerkleAirdrop.sol
export const AIRDROP_ABI = [
  {
    inputs: [
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'bytes32[]', name: 'proof', type: 'bytes32[]' },
    ],
    name: 'claim',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'hasClaimed',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'merkleRoot',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'claimant', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'Claimed',
    type: 'event',
  },
]

// ─── FILL THIS IN after deploying to Sepolia ───────────────────────────────
// 1. Deploy AethToken.sol  → copy address → pass as constructor arg to MerkleAirdrop
// 2. Deploy MerkleAirdrop.sol with (aethTokenAddress, merkleRoot)
// 3. Paste the deployed MerkleAirdrop address below
export const AIRDROP_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000'
