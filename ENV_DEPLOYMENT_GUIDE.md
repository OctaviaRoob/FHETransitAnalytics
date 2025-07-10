# 🌍 环境变量部署指南 (ENV-Based Deployment)

基于 .env 配置文件的一键部署指南

---

## 📋 快速开始

### 1. 配置环境变量

复制环境变量模板：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 选择部署网络 (sepolia | zama | zamaTestnet)
DEPLOY_NETWORK=sepolia

# 部署者私钥 (不带 0x 前缀)
PRIVATE_KEY=your_private_key_here

# 网络 RPC URLs
SEPOLIA_RPC_URL=https://rpc.sepolia.org
ZAMA_RPC_URL=https://devnet.zama.ai
ZAMA_TESTNET_RPC_URL=https://fhevm-testnet.zama.ai

# Etherscan API 密钥 (用于验证)
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

### 2. 一键部署

```bash
# 根据 .env 中的 DEPLOY_NETWORK 自动部署
npm run deploy
```

就这么简单！合约会自动部署到 `.env` 文件中指定的网络。

---

## 🎯 三种部署方式

### 方式 1: 使用 .env 配置 (推荐) ⭐

**步骤：**

1. 编辑 `.env` 文件设置 `DEPLOY_NETWORK`
2. 运行 `npm run deploy`

**示例：部署到 Sepolia**

```env
# .env 文件
DEPLOY_NETWORK=sepolia
PRIVATE_KEY=abc123...
SEPOLIA_RPC_URL=https://rpc.sepolia.org
```

```bash
npm run deploy
```

**示例：部署到 Zama**

```env
# .env 文件
DEPLOY_NETWORK=zama
PRIVATE_KEY=abc123...
ZAMA_RPC_URL=https://devnet.zama.ai
```

```bash
npm run deploy
```

---

### 方式 2: 使用预定义脚本

直接指定网络，无需修改 .env：

```bash
# 部署到 Sepolia
npm run deploy:sepolia

# 部署到 Zama Devnet (完整 FHE 支持)
npm run deploy:zama

# 部署到 Zama Testnet (完整 FHE 支持)
npm run deploy:zama-testnet
```

---

### 方式 3: 使用 Hardhat CLI

手动指定网络：

```bash
# 部署到 Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# 部署到 Zama
npx hardhat run scripts/deploy.js --network zama

# 部署到 Zama Testnet
npx hardhat run scripts/deploy.js --network zamaTestnet
```

---

## 🌐 支持的网络

### Sepolia (Ethereum Testnet)

**特性：**

- ✅ 公共以太坊测试网
- ⚠️ 有限的 FHE 支持
- ✅ Etherscan 验证
- ✅ 免费测试 ETH

**配置：**

```env
DEPLOY_NETWORK=sepolia
SEPOLIA_RPC_URL=https://rpc.sepolia.org
```

**获取测试 ETH：**

- https://sepoliafaucet.com/
- https://faucet.quicknode.com/ethereum/sepolia

**部署：**

```bash
npm run deploy:sepolia
```

**注意：** FHE 功能可能不完全可用

---

### Zama Devnet (完整 FHE 支持)

**特性：**

- ✅ 完整 FHE 加密支持
- ✅ Gateway 解密可用
- ✅ 所有加密操作完全功能
- 🔧 开发测试环境

**配置：**

```env
DEPLOY_NETWORK=zama
ZAMA_RPC_URL=https://devnet.zama.ai
```

**部署：**

```bash
npm run deploy:zama
```

**最佳用途：** 开发和测试 FHE 功能

---

### Zama Testnet (完整 FHE 支持)

**特性：**

- ✅ 完整 FHE 加密支持
- ✅ Gateway 解密可用
- ✅ 生产前测试环境
- ✅ 更稳定的网络

**配置：**

```env
DEPLOY_NETWORK=zamaTestnet
ZAMA_TESTNET_RPC_URL=https://fhevm-testnet.zama.ai
```

**部署：**

```bash
npm run deploy:zama-testnet
```

**最佳用途：** 生产前最终测试

---

## 📊 部署输出示例

### 部署到 Sepolia

```
======================================================================
🚀 Deploying ConfidentialTransitAnalytics with FHE Support
======================================================================

🌍 Deployment Configuration:
   ENV DEPLOY_NETWORK: sepolia
   Active Network: sepolia

📡 Network Information:
   Network Name: sepolia
   Chain ID: 11155111
   RPC URL: https://rpc.sepolia.org

🔐 FHE Support:
   ⚠️  Limited FHE support on sepolia
   ⚠️  Contract will deploy but FHE features may not work
   💡 Use Zama networks (zama/zamaTestnet) for full FHE support

👤 Deployer Information:
   Address: 0x1234...
   Balance: 0.5 ETH

🏗️  Compiling contracts...
🚀 Deploying contract...

======================================================================
✅ Deployment Successful!
======================================================================

📜 Contract Information:
   Contract Address: 0x6Be5E20244cCAF9cBf47E6Af39933C5E7aC8c12c
   Network: sepolia
   Chain ID: 11155111

💾 Deployment info saved to: deployments/sepolia.json
```

### 部署到 Zama

```
======================================================================
🚀 Deploying ConfidentialTransitAnalytics with FHE Support
======================================================================

🌍 Deployment Configuration:
   ENV DEPLOY_NETWORK: zama
   Active Network: zama

📡 Network Information:
   Network Name: zama
   Chain ID: 9000
   RPC URL: https://devnet.zama.ai

🔐 FHE Support:
   ✅ Full FHE encryption support available
   ✅ Gateway decryption available
   ✅ All encrypted operations fully functional

👤 Deployer Information:
   Address: 0x1234...
   Balance: 1.0 ETH

🏗️  Compiling contracts...
🚀 Deploying contract...

======================================================================
✅ Deployment Successful!
======================================================================

📜 Contract Information:
   Contract Address: 0xabcd...
   Network: zama
   Chain ID: 9000

💾 Deployment info saved to: deployments/zama.json
```

---

## 🔧 完整工作流程

### 完整部署流程

```bash
# 1. 配置环境
cp .env.example .env
# 编辑 .env 设置网络和私钥

# 2. 安装依赖
npm install

# 3. 编译合约
npm run compile

# 4. 部署合约 (根据 .env 中的 DEPLOY_NETWORK)
npm run deploy

# 5. 验证合约 (仅 Sepolia)
npm run verify:sepolia

# 6. 测试交互
npm run interact -- status
```

---

## 📁 部署信息保存

部署成功后，信息会自动保存到：

```
deployments/
├── sepolia.json      # Sepolia 部署信息
├── zama.json         # Zama Devnet 部署信息
└── zamaTestnet.json  # Zama Testnet 部署信息
```

**部署信息格式：**

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

## 🔍 环境变量说明

### 必需变量

| 变量             | 说明         | 示例                             |
| ---------------- | ------------ | -------------------------------- |
| `DEPLOY_NETWORK` | 部署目标网络 | `sepolia`, `zama`, `zamaTestnet` |
| `PRIVATE_KEY`    | 部署者私钥   | `abc123...` (不带 0x)            |

### 网络配置变量

| 变量                   | 说明             | 默认值                          |
| ---------------------- | ---------------- | ------------------------------- |
| `SEPOLIA_RPC_URL`      | Sepolia RPC 端点 | `https://rpc.sepolia.org`       |
| `ZAMA_RPC_URL`         | Zama Devnet RPC  | `https://devnet.zama.ai`        |
| `ZAMA_TESTNET_RPC_URL` | Zama Testnet RPC | `https://fhevm-testnet.zama.ai` |

### 可选变量

| 变量                | 说明               | 用途         |
| ------------------- | ------------------ | ------------ |
| `ETHERSCAN_API_KEY` | Etherscan API 密钥 | 用于合约验证 |

---

## ⚙️ Hardhat 配置

`hardhat.config.js` 自动读取环境变量：

```javascript
const DEPLOY_NETWORK = process.env.DEPLOY_NETWORK || "sepolia";

module.exports = {
  defaultNetwork: DEPLOY_NETWORK, // 从 .env 读取
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org",
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
    },
    zama: {
      url: process.env.ZAMA_RPC_URL || "https://devnet.zama.ai",
      accounts: [PRIVATE_KEY],
      chainId: 9000,
    },
    zamaTestnet: {
      url: process.env.ZAMA_TESTNET_RPC_URL || "https://fhevm-testnet.zama.ai",
      accounts: [PRIVATE_KEY],
      chainId: 8009,
    },
  },
};
```

---

## 🔐 FHE 功能支持对比

| 网络             | FHE 加密 | Gateway 解密 | euint8/euint32 | ebool   | 生产就绪 |
| ---------------- | -------- | ------------ | -------------- | ------- | -------- |
| **Zama Devnet**  | ✅ 完整  | ✅ 可用      | ✅ 支持        | ✅ 支持 | 🔧 开发  |
| **Zama Testnet** | ✅ 完整  | ✅ 可用      | ✅ 支持        | ✅ 支持 | ✅ 测试  |
| **Sepolia**      | ⚠️ 有限  | ❌ 不可用    | ⚠️ 部分        | ⚠️ 部分 | ⚠️ 演示  |

**建议：**

- 🔧 **开发阶段**：使用 `zama` (Devnet)
- ✅ **测试阶段**：使用 `zamaTestnet` (Testnet)
- 📱 **前端演示**：使用 `sepolia` (公共可访问)

---

## 🛠️ 故障排除

### 问题 1: "DEPLOY_NETWORK not set"

**解决方案：**

```bash
# 确保 .env 文件存在
cp .env.example .env

# 编辑 .env 设置 DEPLOY_NETWORK
DEPLOY_NETWORK=sepolia
```

### 问题 2: "insufficient funds"

**解决方案：**

- 检查部署者地址余额
- 从水龙头获取测试 ETH
- 确认 PRIVATE_KEY 正确

### 问题 3: "network not supported"

**解决方案：**

```env
# 使用正确的网络名称
DEPLOY_NETWORK=sepolia    # ✅ 正确
DEPLOY_NETWORK=Sepolia    # ❌ 错误 (大小写敏感)
```

### 问题 4: "RPC URL not configured"

**解决方案：**

```env
# 确保对应网络的 RPC URL 已配置
SEPOLIA_RPC_URL=https://rpc.sepolia.org
ZAMA_RPC_URL=https://devnet.zama.ai
```

---

## 📚 相关文档

- **完整部署指南**：`DEPLOYMENT.md`
- **项目结构**：`PROJECT_STRUCTURE.md`
- **使用说明**：`README.md`
- **Hardhat 框架总结**：`HARDHAT_FRAMEWORK_SUMMARY.md`

---

## ✅ 检查清单

部署前检查：

- [ ] `.env` 文件已创建
- [ ] `DEPLOY_NETWORK` 已设置
- [ ] `PRIVATE_KEY` 已配置
- [ ] 对应网络的 RPC URL 已配置
- [ ] 部署者地址有足够余额
- [ ] 已运行 `npm install`
- [ ] 已运行 `npm run compile`

部署后检查：

- [ ] 合约部署成功
- [ ] 部署信息已保存到 `deployments/<network>.json`
- [ ] 合约地址已记录
- [ ] (Sepolia) 合约已在 Etherscan 验证
- [ ] 前端配置已更新
- [ ] 基本功能已测试

---

## 🎯 最佳实践

### 1. 网络选择

```env
# 开发测试 FHE 功能
DEPLOY_NETWORK=zama

# 生产前测试
DEPLOY_NETWORK=zamaTestnet

# 公共演示 (有限 FHE)
DEPLOY_NETWORK=sepolia
```

### 2. 安全性

```bash
# ✅ 好的做法
- 使用专用部署钱包
- 定期轮换私钥
- 不提交 .env 到 git
- 使用环境变量管理服务

# ❌ 坏的做法
- 使用主钱包部署
- 硬编码私钥
- 提交 .env 到版本控制
- 共享私钥
```

### 3. 测试流程

```bash
# 1. 本地测试
npm test

# 2. 部署到开发网
DEPLOY_NETWORK=zama npm run deploy

# 3. 测试功能
npm run interact -- status
npm run simulate

# 4. 部署到测试网
DEPLOY_NETWORK=zamaTestnet npm run deploy

# 5. 最终验证
npm run verify
```

---

**最后更新：** 2025-01-15
**版本：** 2.0.0
**特性：** ✅ 环境变量驱动部署
