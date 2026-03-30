# Conduit

A Web3 platform built on Base with React, Vite, wagmi, and thirdweb.

## Stack

- **Frontend**: React 18, Vite, wagmi v2, viem, TailwindCSS
- **Backend**: Node.js, Express, WebSocket (ws)
- **Chain**: Base Sepolia (testnet) / Base (mainnet)
- **Token**: ConduitToken (CDT) — ERC20

## Deployed Contracts

| Contract | Network | Address |
|---|---|---|
| ConduitToken (CDT) | Base Sepolia | `0x719d3f3E01E365F9aa73374674499539fdD0f82E` |

## Setup

```bash
# Install dependencies
npm install

# Copy env file
cp .env.example .env
# Fill in your keys in .env

# Run frontend + backend
npm run dev:all
```

## Deploy Token

```bash
# Set your deployer key
$env:DEPLOYER_KEY="your_private_key"

# Compile
npx hardhat compile

# Deploy to Base Sepolia
npx hardhat run .\scripts\deploy.cjs --network base-sepolia
```

## Environment Variables

See `.env.example` for all required variables.

## Networks (hardhat.config.js)

| Network | Chain ID | RPC |
|---|---|---|
| `base-sepolia` | 84532 | https://sepolia.base.org |
| `base` | 8453 | https://mainnet.base.org |
| `sepolia` | 11155111 | https://rpc.sepolia.org |

## Production

Deployed on Render: https://conduit-api1.onrender.com
