# Transit Analytics

Privacy-Preserving Transit Card Analytics Platform using Fully Homomorphic Encryption (FHE)

## Tech Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Blockchain:** Ethereum Sepolia Testnet
- **Web3 Libraries:** Wagmi v2 + RainbowKit
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI (Headless Components)
- **Build Tool:** ESBuild (via Next.js)
- **Deployment:** Vercel (Root Directory)

## Features

- 🔐 **Privacy-First:** FHE encryption for individual data
- 🎨 **Modern UI:** Beautiful dark theme with Radix UI components
- ⚡ **Fast Performance:** Optimized with ESBuild and Next.js 14
- 📱 **Responsive Design:** Works on all devices
- 🔄 **Real-time Updates:** Live transaction status
- 📊 **Transaction History:** Local storage of all interactions
- ⚠️ **Error Handling:** Comprehensive error messages
- ✅ **Loading States:** Clear feedback for all operations

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_CONTRACT_ADDRESS=0x6Be5E20244cCAF9cBf47E6Af39933C5E7aC8c12c
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://rpc.sepolia.org
```

Get WalletConnect Project ID: https://cloud.walletconnect.com

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Build for Production

```bash
npm run build
npm start
```

## Deployment to Vercel

### Method 1: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel
```

### Method 2: GitHub Integration

1. Push code to GitHub
2. Import repository in Vercel
3. Configure environment variables
4. Deploy automatically

## Project Structure

```
transit-analytics/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main page
│   ├── providers.tsx      # Web3 providers
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # UI primitives
│   └── ...               # Business components
├── lib/                  # Utilities
│   ├── hooks/           # Custom React hooks
│   └── utils.ts         # Helper functions
├── config/              # Configuration
│   ├── contract.ts      # Contract ABI
│   └── wagmi.ts         # Wagmi config
└── types/               # TypeScript types
```

## Smart Contract

**Address:** `0x6Be5E20244cCAF9cBf47E6Af39933C5E7aC8c12c`
**Network:** Sepolia Testnet (Chain ID: 11155111)
**Explorer:** [View on Etherscan](https://sepolia.etherscan.io/address/0x6Be5E20244cCAF9cBf47E6Af39933C5E7aC8c12c)

## Key Features

### Wallet Connection
- Multi-wallet support via RainbowKit
- Auto-switch to Sepolia network
- Connection status indicator

### Contract Interactions
- **Initialize Period:** Start new data collection period
- **Submit Data:** Submit encrypted transit card data
- **Perform Analysis:** Execute FHE analysis
- **View Results:** See aggregated statistics

### User Experience
- Loading spinners during transactions
- Success/error toast notifications
- Transaction history with Etherscan links
- Real-time contract status updates

## Development

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build
npm run build
```

## License

MIT

## Links

- **Documentation:** [PROJECT_SETUP.md](./PROJECT_SETUP.md)
- **Contract Source:** [GitHub](https://github.com/OctaviaRoob/ConfidentialTransitAnalytics)
- **Zama fhEVM:** [https://docs.zama.ai/fhevm](https://docs.zama.ai/fhevm)
