# Deployment Guide

## Prerequisites

1. **Node.js** >= 18.0.0
2. **npm** or **yarn**
3. **Vercel Account** (free tier works)
4. **WalletConnect Project ID**

---

## Step 1: Get WalletConnect Project ID

1. Visit: https://cloud.walletconnect.com
2. Sign up or log in
3. Create a new project
4. Copy the Project ID

---

## Step 2: Prepare Repository

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit: Transit Analytics"

# Push to GitHub
git remote add origin <your-repo-url>
git push -u origin main
```

---

## Step 3: Deploy to Vercel

### Method A: Vercel Dashboard (Recommended)

1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./` (root)
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`

5. Add Environment Variables:
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` = your_project_id
   - `NEXT_PUBLIC_CONTRACT_ADDRESS` = 0x6Be5E20244cCAF9cBf47E6Af39933C5E7aC8c12c
   - `NEXT_PUBLIC_CHAIN_ID` = 11155111
   - `NEXT_PUBLIC_SEPOLIA_RPC_URL` = https://rpc.sepolia.org

6. Click "Deploy"

### Method B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: transit-analytics
# - Directory: ./
# - Override settings? No

# Set environment variables
vercel env add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
vercel env add NEXT_PUBLIC_CONTRACT_ADDRESS
vercel env add NEXT_PUBLIC_CHAIN_ID
vercel env add NEXT_PUBLIC_SEPOLIA_RPC_URL

# Deploy to production
vercel --prod
```

---

## Step 4: Verify Deployment

1. Visit your Vercel deployment URL
2. Connect wallet
3. Check contract interaction works
4. Test all features

---

## Environment Variables Reference

| Variable | Value | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Your Project ID | From WalletConnect Cloud |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | `0x6Be5E20244cCAF9cBf47E6Af39933C5E7aC8c12c` | Smart contract address |
| `NEXT_PUBLIC_CHAIN_ID` | `11155111` | Sepolia chain ID |
| `NEXT_PUBLIC_SEPOLIA_RPC_URL` | `https://rpc.sepolia.org` | Sepolia RPC endpoint |

---

## Custom Domain (Optional)

1. In Vercel Dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

---

## Continuous Deployment

Once connected to GitHub, Vercel automatically:
- Deploys on every push to `main` branch
- Creates preview deployments for pull requests
- Runs build checks

---

## Troubleshooting

### Build Fails

**Check:**
- All environment variables are set
- Node.js version >= 18
- No TypeScript errors: `npm run type-check`

### Wallet Connection Fails

**Check:**
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set correctly
- Project ID is valid on WalletConnect Cloud

### Contract Interaction Fails

**Check:**
- `NEXT_PUBLIC_CONTRACT_ADDRESS` is correct
- `NEXT_PUBLIC_CHAIN_ID` matches Sepolia (11155111)
- User's wallet is connected to Sepolia network

---

## Performance Optimization

Vercel automatically provides:
- ✅ Global CDN
- ✅ Automatic HTTPS
- ✅ Image optimization
- ✅ Edge caching
- ✅ Compression

---

## Monitoring

View deployment logs and analytics:
- https://vercel.com/dashboard
- Click on your project
- View "Deployments" and "Analytics" tabs

---

## Support

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Wagmi Docs:** https://wagmi.sh
- **RainbowKit Docs:** https://rainbowkit.com

---

**Last Updated:** 2025-10-23
**Deployment Platform:** Vercel
**Framework:** Next.js 14
