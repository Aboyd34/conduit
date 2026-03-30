# Conduit

A Web3 platform built on Base Sepolia — featuring wallet connect, ERC-20 token integration, and real-time WebSocket communication.

## Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Blockchain**: wagmi v2 + viem v2 + OnchainKit (Base)
- **Backend**: Express + WebSocket (ws)
- **Smart Contracts**: Hardhat + OpenZeppelin
- **Deployment**: Render (API) + Vercel (frontend)

## Token

| | |
|---|---|
| **Name** | ConduitToken |
| **Symbol** | CDT |
| **Network** | Base Sepolia Testnet |
| **Chain ID** | 84532 |
| **Contract** | `0x719d3f3E01E365F9aa73374674499539fdD0f82E` |
| **Supply** | 1,000,000 CDT |
| **Deployer** | `0xAB1CAa7D5dA5AA797b3e00B6bd56aFf516079b80` |

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Fill in your values

# Run frontend + backend
npm run dev:all
```

## Environment Variables

See `.env.example` for all required variables.

## Deploy Contract

```bash
# Set deployer key
$env:DEPLOYER_KEY = "your_private_key"

# Compile
npx hardhat compile

# Deploy to Base Sepolia
npx hardhat run .\scripts\deploy.cjs --network base-sepolia
```

## Network Config

| Network | RPC | Chain ID |
|---|---|---|
| Base Sepolia | https://sepolia.base.org | 84532 |
| Base Mainnet | https://mainnet.base.org | 8453 |
| Sepolia | https://rpc.sepolia.org | 11155111 |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Vite frontend only |
| `npm run dev:server` | Express backend only |
| `npm run dev:all` | Both concurrently |
| `npm run build` | Production build |
| `npm run start` | Production server |
