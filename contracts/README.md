# Aether (AETH) — Smart Contract

## Overview
Aether is the native token of the Conduit decentralized social network, deployed on **Base**.

## Token Details
| Property | Value |
|---|---|
| Name | Aether |
| Symbol | AETH |
| Total Supply | 1,000,000,000 AETH |
| Decimals | 18 |
| Network | Base (chain ID 8453) |
| Standard | ERC-20 + ERC-20Permit |

## Supply Breakdown
| Allocation | % | Amount |
|---|---|---|
| Airdrop / Community | 50% | 500,000,000 AETH |
| Ecosystem / Rewards | 20% | 200,000,000 AETH |
| Team (2yr vest, 6mo cliff) | 15% | 150,000,000 AETH |
| Liquidity | 10% | 100,000,000 AETH |
| Treasury | 5% | 50,000,000 AETH |

## Mechanics

### Airdrop (Merkle)
- Owner sets a Merkle root from the Conduit activity snapshot
- Users call `claimAirdrop(amount, proof)` to claim
- One claim per address, airdrop can be opened/closed by owner

### Recycle
- Users call `recycle(postId)` which burns 10 AETH
- Contract emits `Recycled(sender, postId, amount)` event
- Frontend listens for this event and re-surfaces the post in the feed

### Token-Gated Rooms
- `isGated(address)` returns true if wallet holds >= 100 AETH
- Frontend checks this before allowing entry to `#aether` room

### Team Vesting
- 6-month cliff, linear vest over 2 years
- `releaseTeamVesting()` callable by anyone, releases to team wallet

## Deployment
```bash
npx hardhat run scripts/deploy-aether.js --network base
```

## Testing (Base Sepolia testnet first)
```bash
npx hardhat run scripts/deploy-aether.js --network base-sepolia
```
