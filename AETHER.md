# Aether (AETH) — Launch Playbook

## Overview
Aether is the native token of Conduit. It powers signal economics, token-gated rooms, and the Recycle mechanic.

---

## Step 1 — Deploy to Base Sepolia (testnet)

```bash
npm install --save-dev @nomicfoundation/hardhat-toolbox hardhat
npm install @openzeppelin/contracts

export DEPLOYER_KEY=0x...          # your deployer wallet private key
export TEAM_WALLET=0x...           # team multisig
export LIQUIDITY_WALLET=0x...      # LP wallet
export TREASURY_WALLET=0x...       # treasury multisig
export ECOSYSTEM_WALLET=0x...      # rewards wallet

npx hardhat run scripts/deploy-aether.js --network base-sepolia
```

You'll get a contract address. Test everything on Sepolia first.

---

## Step 2 — Run Airdrop Snapshot

```bash
# Copy your production DB locally
npm install merkletreejs ethers better-sqlite3
node scripts/airdrop-snapshot.js --db conduit.db --out airdrop-snapshot.json
```

This generates `airdrop-snapshot.json` with Merkle root + per-wallet proofs.

---

## Step 3 — Set Merkle Root

Call `setMerkleRoot(root)` on the contract with the root from the snapshot.
Call `setAirdropOpen(true)` to open claiming.

---

## Step 4 — Deploy to Base Mainnet

```bash
npx hardhat run scripts/deploy-aether.js --network base
npx hardhat verify --network base <address> $TEAM_WALLET $LIQUIDITY_WALLET $TREASURY_WALLET $ECOSYSTEM_WALLET
```

---

## Step 5 — Update Conduit

```bash
# In your Render environment variables:
VITE_AETHER_ADDRESS=0x...   # your deployed contract address
```

Redeploy Conduit. The AetherPanel and token-gated room will activate automatically.

---

## Recycle Mechanic
- User clicks ♻️ Recycle on any post
- Frontend calls `aether.recycle(postId)` — burns 10 AETH
- Contract emits `Recycled(sender, postId, amount)` event
- Conduit listens for this event and re-surfaces the post at the top of the feed

## Token-Gated Room (#aether)
- User must hold >= 100 AETH
- Checked via `isGated(address)` read call (free, no gas)
- Gate wall shown to non-holders with current balance + instructions

---

## Airdrop Scoring
| Action | AETH |
|---|---|
| Base allocation (any wallet) | 1,000 |
| Per post published | +50 |
| Per signal received | +20 |
| Per reply received | +10 |
| Pioneer (joined before June 2026) | ×2 |
| Hard cap per wallet | 50,000 |
