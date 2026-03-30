# Conduit Deployment Log

## Base Sepolia Testnet

| Field | Value |
|---|---|
| Contract | ConduitToken (CDT) |
| Address | `0x719d3f3E01E365F9aa73374674499539fdD0f82E` |
| Deployer | `0xAB1CAa7D5dA5AA797b3e00B6bd56aFf516079b80` |
| Network | Base Sepolia (Chain ID: 84532) |
| Supply | 1,000,000 CDT |
| Deployed | 2026-03-29 |
| Explorer | https://sepolia.basescan.org/address/0x719d3f3E01E365F9aa73374674499539fdD0f82E |

## Deploy New Contract

```powershell
$env:DEPLOYER_KEY = "your_key"
npx hardhat run .\scripts\deploy.cjs --network base-sepolia
```

## Verify on Basescan

```bash
npx hardhat verify --network base-sepolia 0x719d3f3E01E365F9aa73374674499539fdD0f82E "0xAB1CAa7D5dA5AA797b3e00B6bd56aFf516079b80"
```

## Import to thirdweb

1. Go to thirdweb dashboard → your project → Tokens
2. Click **Import Token**
3. Contract Address: `0x719d3f3E01E365F9aa73374674499539fdD0f82E`
4. Network: **Base Sepolia Testnet**
5. Click Import
