require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: '0.8.26',
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: 'cancun',
    },
  },
  networks: {
    hardhat: {
      allowBlocksWithSameTimestamp: true,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.org',
      accounts: process.env.DEPLOYER_KEY ? [process.env.DEPLOYER_KEY] : [],
      chainId: 11155111,
    },
    'base-sepolia': {
      url: 'https://sepolia.base.org',
      accounts: process.env.DEPLOYER_KEY ? [process.env.DEPLOYER_KEY] : [],
      chainId: 84532,
    },
    base: {
      url: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
      accounts: process.env.DEPLOYER_KEY ? [process.env.DEPLOYER_KEY] : [],
      chainId: 8453,
    },
  },
  etherscan: {
    apiKey: {
      sepolia:        process.env.ETHERSCAN_API_KEY || '',
      'base-sepolia': process.env.BASESCAN_API_KEY  || '',
      base:           process.env.BASESCAN_API_KEY  || '',
    },
  },
};
