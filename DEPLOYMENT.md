# 🚀 Deployment Guide - Confidential Transit Analytics

Complete guide for deploying and managing the ConfidentialTransitAnalytics smart contract.

---

## 📋 Prerequisites

### 1. Environment Setup

**Required Software:**

- Node.js v18+
- npm or yarn
- MetaMask or other Web3 wallet

**Install Dependencies:**

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the project root:

```env
# Private key for deployment (WITHOUT 0x prefix)
PRIVATE_KEY=your_private_key_here

# Sepolia RPC URL (get from Alchemy, Infura, or public RPC)
SEPOLIA_RPC_URL=https://rpc.sepolia.org

# Etherscan API Key (for contract verification)
ETHERSCAN_API_KEY=your_etherscan_api_key

# Optional: Zama fhEVM settings (for FHE networks)
ZAMA_RPC_URL=https://devnet.zama.ai
```

**Security Warning:**

- Never commit `.env` to version control
- Keep your private keys secure
- Use a dedicated deployment wallet

---

## 🏗️ Compilation

Compile the smart contracts:

```bash
npm run compile
```

**Output:**

- Compiled artifacts in `artifacts/` directory
- TypeChain types in `typechain-types/` directory
- ABI files for frontend integration

**Check Contract Size:**

```bash
npm run size
```

---

## 📡 Network Configuration

### Supported Networks

The project supports multiple networks configured in `hardhat.config.js`:

| Network          | Chain ID | Purpose                | FHE Support |
| ---------------- | -------- | ---------------------- | ----------- |
| **Sepolia**      | 11155111 | Ethereum testnet       | ❌ No       |
| **Zama Devnet**  | 9000     | Zama fhEVM development | ✅ Yes      |
| **Zama Testnet** | 8009     | Zama fhEVM testing     | ✅ Yes      |

### Network Selection

Deploy to different networks using:

```bash
# Sepolia (Ethereum testnet)
npm run deploy:sepolia

# Zama fhEVM devnet
npm run deploy:zama

# Custom network
npx hardhat run scripts/deploy.js --network <network-name>
```

---

## 🚀 Deployment Process

### 🌟 Quick Start (Environment-Based Deployment)

**最简单的部署方式：**

```bash
# 1. 配置环境
cp .env.example .env
# 编辑 .env 文件设置 DEPLOY_NETWORK

# 2. 一键部署
npm run deploy
```

详细的环境变量部署指南，请参考 [ENV_DEPLOYMENT_GUIDE.md](./ENV_DEPLOYMENT_GUIDE.md)

---

### 传统部署流程

### Step 1: Fund Deployment Wallet

Get testnet ETH from faucets:

**Sepolia Faucets:**

- https://sepoliafaucet.com/
- https://faucet.quicknode.com/ethereum/sepolia
- https://www.alchemy.com/faucets/ethereum-sepolia

**Zama Faucet:**

- Contact Zama team for devnet tokens

### Step 2: Deploy Contract

```bash
# Deploy to Sepolia
npm run deploy:sepolia
```

**Deployment Output:**

```
======================================================================
🚀 Deploying ConfidentialTransitAnalytics with FHE Support
======================================================================

📡 Network Information:
   Network Name: sepolia
   Chain ID: 11155111
   RPC URL: https://rpc.sepolia.org

👤 Deployer Information:
   Address: 0x1234...
   Balance: 0.5 ETH

🏗️  Compiling contracts...
🚀 Deploying contract...
   Transaction hash: 0xabcd...
   Waiting for confirmations...

======================================================================
✅ Deployment Successful!
======================================================================

📜 Contract Information:
   Contract Address: 0x6Be5E20244cCAF9cBf47E6Af39933C5E7aC8c12c
   Deployer: 0x1234...
   Network: sepolia
   Chain ID: 11155111
   Block Number: 5123456
   Transaction: 0xabcd...
```

### Step 3: Save Deployment Information

Deployment info is automatically saved to:

- `deployments/sepolia.json` (for Sepolia)
- `deployments/zama.json` (for Zama networks)

**Deployment File Structure:**

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

---

## ✅ Contract Verification

Verify your contract on Etherscan (Sepolia only):

### Automatic Verification

```bash
# Using deployment file
npm run verify:sepolia

# With specific address
npm run verify:sepolia 0x6Be5E20244cCAF9cBf47E6Af39933C5E7aC8c12c
```

### Manual Verification

```bash
npx hardhat verify --network sepolia 0x6Be5E20244cCAF9cBf47E6Af39933C5E7aC8c12c
```

**Verification Output:**

```
======================================================================
🔍 Contract Verification Script
======================================================================

📡 Verification Details:
   Network: sepolia
   Contract Address: 0x6Be5E20244cCAF9cBf47E6Af39933C5E7aC8c12c
   Contract Name: ConfidentialTransitAnalytics

🚀 Starting verification process...

======================================================================
✅ Contract Verified Successfully!
======================================================================

🔗 View Contract:
   https://sepolia.etherscan.io/address/0x6Be5E20244cCAF9cBf47E6Af39933C5E7aC8c12c#code
```

**Benefits of Verification:**

- ✅ Source code publicly viewable
- ✅ ABI available on Etherscan
- ✅ Read/Write functions accessible
- ✅ Enhanced trust and transparency

---

## 🔧 Post-Deployment Configuration

### 1. Update Frontend Configuration

Update `public/config.js` or `public/index.html`:

```javascript
const CONTRACT_ADDRESS = "0x6Be5E20244cCAF9cBf47E6Af39933C5E7aC8c12c";
const NETWORK_ID = 11155111; // Sepolia
```

### 2. Initialize First Period

Initialize the contract during an odd hour (UTC+3):

```bash
npm run interact -- init
```

**Odd Hours (UTC+3):** 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23

### 3. Test Basic Functionality

Check contract status:

```bash
npm run interact -- status
```

Run full simulation:

```bash
npm run simulate
```

---

## 📚 Deployment Scripts Reference

### `scripts/deploy.js`

Main deployment script with features:

- Network detection
- Balance checking
- Automatic compilation
- Deployment info saving
- Initial state verification

**Usage:**

```bash
npm run deploy
npm run deploy:sepolia
npm run deploy:zama
```

### `scripts/verify.js`

Contract verification script:

- Loads deployment info
- Verifies on Etherscan
- Provides block explorer links

**Usage:**

```bash
npm run verify
npm run verify:sepolia <address>
node scripts/verify.js sepolia
```

### `scripts/interact.js`

Contract interaction script for:

- Status checking
- Period initialization
- Data submission
- Analysis execution
- Pause/unpause

**Usage:**

```bash
npm run interact -- status
npm run interact -- init
npm run interact -- submit 500 10
npm run interact -- analyze
npm run interact -- period 1
```

### `scripts/simulate.js`

Full workflow simulation:

- Period initialization
- Multiple user submissions
- Analysis execution
- Results viewing

**Usage:**

```bash
npm run simulate
```

---

## 🌐 Current Deployments

### Sepolia Testnet

**Contract Address:** [`0x6Be5E20244cCAF9cBf47E6Af39933C5E7aC8c12c`](https://sepolia.etherscan.io/address/0x6Be5E20244cCAF9cBf47E6Af39933C5E7aC8c12c)

- **Network:** Sepolia Testnet
- **Chain ID:** 11155111
- **Explorer:** https://sepolia.etherscan.io
- **Deployed:** 2025-01-15
- **Status:** ✅ Verified

**Live Demo:** https://confidential-transit-analytics.vercel.app/

---

## 🔍 Verification & Testing

### Test Contract Functions

1. **Check Status:**

```bash
npm run interact -- status
```

2. **Initialize Period (Odd Hour):**

```bash
npm run interact -- init
```

3. **Submit Data:**

```bash
npm run interact -- submit 500 10
```

4. **Perform Analysis (Even Hour):**

```bash
npm run interact -- analyze
```

5. **View History:**

```bash
npm run interact -- period 1
```

### Run Unit Tests

```bash
npm test
```

---

## ⚠️ Troubleshooting

### Common Issues

**1. Insufficient Balance**

```
Error: insufficient funds for gas
```

**Solution:** Fund your deployment wallet with testnet ETH

**2. Wrong Time Window**

```
Error: OnlyOddHoursAllowed()
```

**Solution:** Wait for odd hour (UTC+3) to initialize period

**3. Network Connection**

```
Error: could not detect network
```

**Solution:** Check RPC URL in `.env` file

**4. Verification Failed**

```
Error: Etherscan API key required
```

**Solution:** Add `ETHERSCAN_API_KEY` to `.env`

**5. Contract Already Deployed**

- Check `deployments/` folder for existing deployments
- Use existing contract or deploy to different network

---

## 📊 Gas Costs (Sepolia)

Estimated gas costs for operations:

| Operation         | Gas Used   | Cost (Gwei)  |
| ----------------- | ---------- | ------------ |
| Deploy            | ~3,500,000 | ~0.0035 ETH  |
| Initialize Period | ~150,000   | ~0.00015 ETH |
| Submit Data       | ~200,000   | ~0.0002 ETH  |
| Perform Analysis  | ~180,000   | ~0.00018 ETH |

_Costs vary based on network congestion_

---

## 🔐 Security Considerations

### Best Practices

1. **Private Key Security**

   - Never share or commit private keys
   - Use hardware wallet for mainnet
   - Create dedicated deployment wallet

2. **Contract Verification**

   - Always verify on Etherscan
   - Review source code before deployment
   - Test thoroughly on testnet first

3. **Access Control**

   - Transfer authority to multisig
   - Add multiple pausers
   - Document all privileged operations

4. **Emergency Procedures**
   - Test pause functionality
   - Have rollback plan
   - Monitor contract events

---

## 📞 Support & Resources

### Documentation

- Smart Contract: `contracts/ConfidentialTransitAnalytics.sol`
- README: `README.md`
- Implementation: `IMPLEMENTATION.md`

### External Resources

- Hardhat: https://hardhat.org/
- Zama fhEVM: https://docs.zama.ai/fhevm
- Etherscan: https://etherscan.io/
- Sepolia Faucet: https://sepoliafaucet.com/

### Contract Links

- Sepolia: https://sepolia.etherscan.io/address/0x6Be5E20244cCAF9cBf47E6Af39933C5E7aC8c12c
- GitHub: https://github.com/OctaviaRoob/ConfidentialTransitAnalytics

---

## ✅ Deployment Checklist

Before going live:

- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file configured
- [ ] Deployment wallet funded
- [ ] Contract compiled successfully
- [ ] Contract deployed to testnet
- [ ] Contract verified on Etherscan
- [ ] Deployment info saved
- [ ] Frontend updated with contract address
- [ ] Basic functionality tested
- [ ] Period initialization tested
- [ ] Data submission tested
- [ ] Analysis execution tested
- [ ] Security audit completed (for mainnet)
- [ ] Documentation updated
- [ ] Team trained on operations

---

## 🎉 Next Steps

After successful deployment:

1. **Update Frontend**

   - Configure contract address
   - Test wallet connection
   - Verify all features work

2. **User Testing**

   - Invite beta testers
   - Gather feedback
   - Fix any issues

3. **Documentation**

   - Update README with live links
   - Create user guides
   - Prepare demo materials

4. **Monitoring**

   - Track contract events
   - Monitor gas usage
   - Check for errors

5. **Maintenance**
   - Plan regular upgrades
   - Monitor security advisories
   - Keep dependencies updated

---

**Last Updated:** 2025-01-15
**Contract Version:** 1.0.0
**Solidity Version:** 0.8.24
