# Transit Analytics - Next.js Project Setup Guide

## 🎯 项目概述

**名称:** Transit Analytics
**技术栈:** Next.js 14 + TypeScript + Wagmi + RainbowKit + Tailwind CSS + Radix UI
**部署:** Vercel (根目录部署)
**网络:** Sepolia Testnet

---

## 📦 已创建的文件结构

```
transit-analytics/
├── app/
│   ├── layout.tsx              ✅ Root layout with Providers
│   ├── globals.css             ✅ Global styles with Tailwind
│   ├── providers.tsx           ✅ Wagmi + RainbowKit providers
│   └── page.tsx                ⏳ Main page (需创建)
│
├── components/
│   └── ui/
│       ├── loading.tsx         ✅ Loading components
│       ├── card.tsx            ⏳ Card component (需创建)
│       └── toast.tsx           ⏳ Toast notifications (需创建)
│
├── lib/
│   ├── utils.ts                ✅ Utility functions
│   └── hooks/
│       ├── useContract.ts      ✅ Contract interaction hooks
│       └── useTransactionHistory.ts  ✅ Transaction history hook
│
├── config/
│   ├── contract.ts             ✅ Contract ABI and address
│   └── wagmi.ts                ✅ Wagmi configuration
│
├── types/
│   └── index.ts                ✅ TypeScript type definitions
│
├── package.json                ✅ Dependencies configured
├── tsconfig.json               ✅ TypeScript config
├── tailwind.config.ts          ✅ Tailwind config
├── next.config.js              ✅ Next.js config
├── postcss.config.js           ✅ PostCSS config
├── .eslintrc.json              ✅ ESLint config
├── .gitignore                  ✅ Git ignore
└── .env.example                ✅ Environment variables template
```

---

## 🚀 安装依赖

```bash
cd D:\zamadapp\transit-analytics
npm install
```

---

## 🔧 环境配置

1. 复制环境变量模板:
```bash
cp .env.example .env.local
```

2. 编辑 `.env.local`:
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_CONTRACT_ADDRESS=0x6Be5E20244cCAF9cBf47E6Af39933C5E7aC8c12c
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://rpc.sepolia.org
```

**获取 WalletConnect Project ID:**
- 访问: https://cloud.walletconnect.com
- 注册账号
- 创建新项目
- 复制 Project ID

---

## 📝 待创建的核心文件

### 1. 主页面 (app/page.tsx)

需包含:
- 连接钱包按钮
- 合约状态展示
- 数据提交表单
- 分析执行按钮
- 交易历史

### 2. UI 组件

- `components/ui/card.tsx` - 卡片组件
- `components/ui/button.tsx` - 按钮组件
- `components/ui/input.tsx` - 输入框组件
- `components/ui/toast.tsx` - 通知组件

### 3. 业务组件

- `components/ContractStatus.tsx` - 合约状态显示
- `components/DataSubmission.tsx` - 数据提交表单
- `components/AnalysisPanel.tsx` - 分析面板
- `components/TransactionHistory.tsx` - 交易历史
- `components/TimeWindow.tsx` - 时间窗口指示器

---

## 🎨 主要功能特性

### 1. 钱包连接
- ✅ RainbowKit 集成
- ✅ 多钱包支持 (MetaMask, WalletConnect, Coinbase, 等)
- ✅ 自动切换到 Sepolia 网络

### 2. 合约交互
- ✅ 读取合约状态
- ✅ 初始化周期
- ✅ 提交加密数据
- ✅ 执行分析
- ✅ 暂停/恢复合约

### 3. 加载状态
- ✅ 交易待确认状态
- ✅ 交易确认中状态
- ✅ 成功/失败反馈
- ✅ Spinner 动画

### 4. 错误处理
- ✅ 用户拒绝交易
- ✅ 余额不足
- ✅ 合约错误
- ✅ 网络错误
- ✅ 友好的错误提示

### 5. 交易历史
- ✅ 本地存储历史记录
- ✅ 交易类型标识
- ✅ 时间戳
- ✅ 状态追踪
- ✅ Etherscan 链接

---

## 🎯 开发命令

```bash
# 开发服务器
npm run dev

# 类型检查
npm run type-check

# Lint 检查
npm run lint

# 构建生产版本
npm run build

# 启动生产服务器
npm run start
```

---

## 🌐 Vercel 部署配置

### 方式 1: 通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel
```

### 方式 2: 通过 GitHub

1. 推送代码到 GitHub
2. 在 Vercel 中导入仓库
3. 配置环境变量
4. 自动部署

### 环境变量配置

在 Vercel Dashboard 中设置:
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- `NEXT_PUBLIC_CONTRACT_ADDRESS`
- `NEXT_PUBLIC_CHAIN_ID`
- `NEXT_PUBLIC_SEPOLIA_RPC_URL`

---

## 📊 项目特点

### ✅ 现代化技术栈
- Next.js 14 (App Router)
- TypeScript (类型安全)
- Wagmi v2 (最新 Web3 库)
- RainbowKit (最佳钱包 UI)
- Tailwind CSS (实用优先)
- Radix UI (无障碍组件)

### ✅ 最佳实践
- 服务端渲染 (SSR)
- 客户端组件优化
- TypeScript 严格模式
- ESLint 代码检查
- 响应式设计
- 暗色主题

### ✅ 开发体验
- 热重载
- 类型提示
- 自动导入
- 快速构建 (ESBuild)

---

## 🔐 安全考虑

1. **私钥安全**
   - 永远不要提交 .env 文件
   - 使用环境变量

2. **合约交互**
   - 用户确认所有交易
   - 显示交易详情
   - 错误处理完善

3. **数据隐私**
   - 本地存储交易历史
   - 不上传敏感信息

---

## 📚 技术文档

### Wagmi
- https://wagmi.sh/

### RainbowKit
- https://www.rainbowkit.com/

### Next.js
- https://nextjs.org/docs

### Tailwind CSS
- https://tailwindcss.com/docs

### Radix UI
- https://www.radix-ui.com/

---

## 🎉 下一步

1. **安装依赖**
```bash
npm install
```

2. **配置环境变量**
```bash
cp .env.example .env.local
# 编辑 .env.local
```

3. **启动开发服务器**
```bash
npm run dev
```

4. **访问应用**
```
http://localhost:3000
```

---

## 📞 支持

如遇问题请参考:
- Next.js 文档
- Wagmi 文档
- RainbowKit 文档
- 项目 GitHub Issues

---

**创建时间:** 2025-10-23
**版本:** 1.0.0
**技术栈:** Next.js 14 + TypeScript + Wagmi + RainbowKit
