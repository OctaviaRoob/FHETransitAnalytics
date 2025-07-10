# 📁 Project Structure

Complete directory structure and file descriptions for ConfidentialTransitAnalytics.

---

## 🗂️ Directory Overview

```
ConfidentialTransitAnalytics/
├── contracts/                   # Smart contract sources
├── scripts/                     # Deployment and utility scripts
├── test/                        # Test files
├── deployments/                 # Deployment information (auto-generated)
├── artifacts/                   # Compiled contracts (auto-generated)
├── cache/                       # Hardhat cache (auto-generated)
├── typechain-types/             # TypeScript types (auto-generated)
├── public/                      # Frontend files
├── hardhat.config.js            # Hardhat configuration
├── package.json                 # Project dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── .env                         # Environment variables (not in git)
├── .env.example                 # Environment template
├── README.md                    # Project documentation
├── DEPLOYMENT.md                # Deployment guide
├── IMPLEMENTATION.md            # Implementation details
└── PROJECT_STRUCTURE.md         # This file
```

---

## 📄 File Descriptions

### Root Configuration Files

#### `hardhat.config.js`
Hardhat framework configuration:
- Solidity compiler settings (v0.8.24)
- Network configurations (Sepolia, Zama devnet, Zama testnet)
- Plugin configurations (fhEVM, TypeChain, Contract Sizer)
- Etherscan verification settings
- Path configurations

**Key Features:**
```javascript
solidity: {
  version: "0.8.24",
  settings: {
    optimizer: { enabled: true, runs: 800 },
    evmVersion: "cancun"
  }
}
```

#### `package.json`
Project metadata and dependencies:
- NPM scripts for common tasks
- Development dependencies (Hardhat, TypeChain, Testing libraries)
- Production dependencies (Zama fhEVM, fhevmjs)

**Available Scripts:**
- `npm run compile` - Compile contracts
- `npm test` - Run tests
- `npm run deploy` - Deploy to Sepolia
- `npm run verify` - Verify on Etherscan
- `npm run interact` - Interact with contract
- `npm run simulate` - Run simulation

#### `tsconfig.json`
TypeScript compiler configuration:
- Target: ES2020
- Module: CommonJS
- Strict type checking enabled
- Includes TypeChain-generated types

#### `.env.example`
Environment variable template:
- `PRIVATE_KEY` - Deployment wallet private key
- `SEPOLIA_RPC_URL` - Sepolia RPC endpoint
- `ETHERSCAN_API_KEY` - For contract verification
- `ZAMA_RPC_URL` - Zama fhEVM endpoint

---

## 📜 Smart Contracts

### `contracts/ConfidentialTransitAnalytics.sol`

Main contract implementing privacy-preserving transit analytics.

**Size:** ~550 lines
**Compiler:** Solidity 0.8.24
**Imports:**
- `@fhevm/solidity/lib/FHE.sol` - FHE operations
- `@fhevm/solidity/config/ZamaConfig.sol` - Network configuration
- `@fhevm/solidity/gateway/Gateway.sol` - Decryption gateway

**Key Components:**

1. **State Variables:**
   - `transitAuthority` - Admin address
   - `currentPeriod` - Active period counter
   - `paused` - Emergency stop flag
   - `cardData` - User submissions (encrypted)
   - `periods` - Period aggregates and metadata

2. **Encrypted Types:**
   - `euint32` - 32-bit encrypted integers (spending, revenue)
   - `euint8` - 8-bit encrypted integers (ride counts)
   - `ebool` - Encrypted booleans (validation flags)

3. **Core Functions:**
   - `initializePeriod()` - Start new analysis period
   - `submitCardData()` - Submit encrypted data
   - `performAnalysis()` - Request decryption
   - `callbackAnalysis()` - Gateway callback

4. **Access Control:**
   - `onlyAuthority` - Transit authority only
   - `onlyPauser` - Pausers only
   - `whenNotPaused` - Active contract only

5. **Time Windows:**
   - Odd hours (UTC+3): Data submission
   - Even hours (UTC+3): Analysis execution

---

## 🔧 Scripts

### `scripts/deploy.js`

**Purpose:** Deploy ConfidentialTransitAnalytics contract

**Features:**
- Network detection and validation
- Balance checking
- Automatic compilation
- Deployment info saving to JSON
- Initial state verification
- Network-specific instructions

**Output:**
- Console deployment report
- `deployments/<network>.json` file

**Usage:**
```bash
npm run deploy:sepolia
npm run deploy:zama
```

---

### `scripts/verify.js`

**Purpose:** Verify contract source code on Etherscan

**Features:**
- Loads deployment info from JSON
- Checks contract existence
- Submits verification to Etherscan
- Provides block explorer links

**Supported Networks:**
- Sepolia
- Goerli
- Mainnet

**Usage:**
```bash
npm run verify:sepolia
npm run verify:sepolia 0x1234...
node scripts/verify.js sepolia
```

---

### `scripts/interact.js`

**Purpose:** Interact with deployed contract

**Commands:**

| Command | Description | Example |
|---------|-------------|---------|
| `status` | Get contract status | `npm run interact -- status` |
| `init` | Initialize period | `npm run interact -- init` |
| `submit` | Submit card data | `npm run interact -- submit 500 10` |
| `analyze` | Perform analysis | `npm run interact -- analyze` |
| `period` | View period history | `npm run interact -- period 1` |
| `pause` | Pause contract | `npm run interact -- pause` |
| `unpause` | Unpause contract | `npm run interact -- unpause` |
| `help` | Show help | `npm run interact -- help` |

**Features:**
- Automatic deployment info loading
- Time window validation
- Transaction confirmation
- Detailed status reporting

---

### `scripts/simulate.js`

**Purpose:** Simulate full contract workflow

**Simulation Steps:**
1. Check current status
2. Initialize period (if needed)
3. Submit data from multiple users
4. Display encrypted state
5. Perform analysis (if in even hour)
6. View decrypted results

**Features:**
- Multi-user simulation
- Time window awareness
- Progress tracking
- Privacy demonstration

**Usage:**
```bash
npm run simulate
```

---

## 🗃️ Generated Directories

### `deployments/`

Stores deployment information for each network.

**Structure:**
```json
{
  "network": "sepolia",
  "chainId": 11155111,
  "contractAddress": "0x6Be5E20244cCAF9cBf47E6Af39933C5E7aC8c12c",
  "deployer": "0x1234...",
  "deploymentBlock": 5123456,
  "deploymentTx": "0xabcd...",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "compiler": "0.8.24",
  "contractName": "ConfidentialTransitAnalytics"
}
```

**Files:**
- `sepolia.json` - Sepolia deployment
- `zama.json` - Zama devnet deployment
- `zamaTestnet.json` - Zama testnet deployment

---

### `artifacts/`

Compiled contract artifacts (auto-generated by Hardhat).

**Contents:**
- Contract ABIs (JSON interfaces)
- Bytecode and deployed bytecode
- Contract metadata
- Build info

**Important Files:**
- `artifacts/contracts/ConfidentialTransitAnalytics.sol/ConfidentialTransitAnalytics.json`

---

### `typechain-types/`

TypeScript type definitions (auto-generated by TypeChain).

**Contents:**
- Contract interfaces
- Event types
- Function parameter types
- Return value types

**Usage in TypeScript:**
```typescript
import { ConfidentialTransitAnalytics } from "../typechain-types";
```

---

### `cache/`

Hardhat compilation cache (auto-generated).
- Do not commit to version control
- Safe to delete (will regenerate on compile)

---

## 🌐 Frontend

### `public/`

Frontend files for web interface.

**Files:**
- `index.html` - Main HTML interface
- `config.js` - Contract address and network config
- `lib/` - External libraries (ethers.js, fhevmjs)

**Configuration:**
```javascript
const CONTRACT_ADDRESS = "0x6Be5E20244cCAF9cBf47E6Af39933C5E7aC8c12c";
const NETWORK_ID = 11155111; // Sepolia
```

---

## 📚 Documentation

### `README.md`
Main project documentation:
- Project overview
- Features and use cases
- Technology stack
- Installation and usage
- Development guide
- Live demo links

### `DEPLOYMENT.md`
Comprehensive deployment guide:
- Prerequisites
- Environment setup
- Network configuration
- Deployment process
- Verification steps
- Post-deployment tasks
- Troubleshooting

### `IMPLEMENTATION.md`
Technical implementation details:
- FHE integration
- Smart contract architecture
- Privacy guarantees
- Security considerations

### `PROJECT_STRUCTURE.md`
This file - complete project structure reference.

---

## 🧪 Testing

### `test/`

Test files for smart contracts.

**Framework:** Hardhat + Mocha + Chai

**Example Test Structure:**
```javascript
describe("ConfidentialTransitAnalytics", function () {
  it("Should initialize period", async function () {
    // Test logic
  });
});
```

**Run Tests:**
```bash
npm test
```

---

## 🔒 Security Files

### `.gitignore`

Prevents sensitive files from being committed:
- `.env` - Environment variables
- `node_modules/` - Dependencies
- `cache/` - Build cache
- `artifacts/` - Compiled contracts
- `deployments/` - (optional) Deployment info

### `.env`

**NEVER commit this file!**

Contains sensitive credentials:
- Private keys
- API keys
- RPC endpoints

Always use `.env.example` as template.

---

## 📊 File Size Reference

| File/Directory | Size | Status |
|----------------|------|--------|
| `contracts/` | ~25 KB | Source code |
| `scripts/` | ~30 KB | Helper scripts |
| `artifacts/` | ~2 MB | Generated |
| `node_modules/` | ~200 MB | Dependencies |
| `README.md` | ~15 KB | Documentation |
| `DEPLOYMENT.md` | ~20 KB | Documentation |

---

## 🔄 Workflow

### Development Workflow

```
1. Write contract → contracts/
2. Compile → npm run compile → artifacts/
3. Test → npm test → test/
4. Deploy → npm run deploy → deployments/
5. Verify → npm run verify
6. Interact → npm run interact
```

### File Dependencies

```
hardhat.config.js
    ↓
contracts/*.sol → compile → artifacts/ + typechain-types/
    ↓
scripts/deploy.js → deploy → deployments/<network>.json
    ↓
scripts/verify.js → verify → Etherscan
    ↓
scripts/interact.js → use → deployed contract
```

---

## 📦 Package Dependencies

### Production Dependencies
- `@fhevm/solidity` - FHE smart contract library
- `@zama-fhe/oracle-solidity` - Oracle integration
- `fhevmjs` - Client-side FHE library

### Development Dependencies
- `hardhat` - Development framework
- `@nomicfoundation/hardhat-toolbox` - Plugin bundle
- `@fhevm/hardhat-plugin` - FHE support
- `@typechain/hardhat` - TypeScript integration
- `hardhat-contract-sizer` - Size analysis
- `typescript` - TypeScript compiler

---

## 🛠️ Maintenance

### Regular Tasks

**Clean Build:**
```bash
npm run clean
rm -rf cache/ artifacts/
npm run compile
```

**Update Dependencies:**
```bash
npm update
npm audit fix
```

**Backup Important Files:**
- `contracts/`
- `scripts/`
- `test/`
- `deployments/`
- `.env` (securely)

---

## ✅ Checklist for New Developers

- [ ] Clone repository
- [ ] Install dependencies (`npm install`)
- [ ] Copy `.env.example` to `.env`
- [ ] Configure `.env` with credentials
- [ ] Compile contracts (`npm run compile`)
- [ ] Run tests (`npm test`)
- [ ] Review `DEPLOYMENT.md`
- [ ] Review smart contract code
- [ ] Understand script usage
- [ ] Deploy to testnet
- [ ] Verify deployment
- [ ] Test interaction scripts
- [ ] Run simulation

---

**Last Updated:** 2025-01-15
**Project Version:** 1.0.0
**Hardhat Version:** 2.22.0
