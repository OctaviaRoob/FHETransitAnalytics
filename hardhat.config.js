require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0000000000000000000000000000000000000000000000000000000000000000";

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      metadata: {
        bytecodeHash: "none",
      },
      optimizer: {
        enabled: true,
        runs: 800
      },
      evmVersion: "cancun"
    }
  },
  networks: {
    // Zama fhEVM Devnet
    zama: {
      url: "https://devnet.zama.ai",
      accounts: [PRIVATE_KEY],
      chainId: 9000,
      gasPrice: 1000000000
    },
    // Zama fhEVM Testnet
    zamaTestnet: {
      url: "https://fhevm-testnet.zama.ai",
      accounts: [PRIVATE_KEY],
      chainId: 8009
    },
    // Regular Sepolia (won't work with fhEVM)
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org",
      accounts: [PRIVATE_KEY],
      chainId: 11155111
    }
  }
};