require("@nomicfoundation/hardhat-toolbox");
require("@fhevm/hardhat-plugin");
require("hardhat-contract-sizer");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0000000000000000000000000000000000000000000000000000000000000000";
const DEPLOY_NETWORK = process.env.DEPLOY_NETWORK || "sepolia";

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
  defaultNetwork: DEPLOY_NETWORK,
  networks: {
    // Ethereum Sepolia Testnet (Public testnet, limited FHE support)
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org",
      accounts: [PRIVATE_KEY],
      chainId: 11155111
    },
    // Zama fhEVM Devnet (Full FHE support)
    zama: {
      url: process.env.ZAMA_RPC_URL || "https://devnet.zama.ai",
      accounts: [PRIVATE_KEY],
      chainId: 9000,
      gasPrice: 1000000000
    },
    // Zama fhEVM Testnet (Full FHE support)
    zamaTestnet: {
      url: process.env.ZAMA_TESTNET_RPC_URL || "https://fhevm-testnet.zama.ai",
      accounts: [PRIVATE_KEY],
      chainId: 8009
    }
  },
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 120000
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || ""
    }
  }
};