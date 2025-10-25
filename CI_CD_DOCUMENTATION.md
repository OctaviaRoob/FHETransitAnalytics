# CI/CD Documentation - Transit Analytics

**Project:** Transit Analytics Platform
**CI/CD Platform:** GitHub Actions
**Deployment:** Vercel (Frontend)
**Status:** ✅ Production Ready

---

## 📋 Overview

This project uses **GitHub Actions** for continuous integration and continuous deployment (CI/CD), automating:

- Smart contract linting, compilation, and testing
- Frontend building, testing, and deployment
- Security scanning and code coverage
- Automated deployments to Vercel

---

## 🔄 CI/CD Workflows

### 1. Smart Contract CI (`contracts-ci.yml`)

**Trigger:**

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

**Jobs:**

#### 📝 Lint

- Runs Solidity linter
- Validates code style and best practices
- **Status:** ⚠️ Non-blocking (continues on error)

#### 🔨 Compile

- Compiles all Solidity contracts
- Generates TypeChain types
- Uploads artifacts for downstream jobs
- **Artifacts:** `contract-artifacts/` (7-day retention)

#### 🧪 Test

- Runs complete test suite (48 tests)
- Validates all contract functionality
- **Status:** ⚠️ Non-blocking (continues on error)
- **Artifacts:** `test-results/` (7-day retention)

#### 📊 Coverage

- Generates code coverage reports
- Uploads to Codecov
- **Target:** > 95% coverage
- **Artifacts:** Coverage reports uploaded

#### ⛽ Gas Report

- Analyzes gas consumption
- Generates gas usage reports
- **Artifacts:** `gasReporterOutput.json` (7-day retention)

#### 🔒 Security

- Runs Slither static analysis
- Checks for vulnerabilities with `npm audit`
- **Status:** ⚠️ Non-blocking (informational)

---

### 2. Frontend CI/CD (`frontend-ci.yml`)

**Trigger:**

- Push to `main` or `develop` branches (with frontend changes)
- Pull requests to `main` or `develop` (with frontend changes)

**Jobs:**

#### 📝 Lint

- Runs ESLint on TypeScript/React code
- Performs TypeScript type checking
- **Blocks:** Further steps if linting fails

#### 🔨 Build

- Builds Next.js production bundle
- Validates environment variables
- **Artifacts:** `frontend-build/` (7-day retention)

#### 🧪 Test

- Runs frontend unit tests
- **Status:** ⚠️ Non-blocking (continues on error)

#### 🚀 Deploy Preview (Pull Requests)

- Deploys to Vercel preview environment
- Comments PR with preview URL
- **Trigger:** Only on pull requests

#### 🌐 Deploy Production (Main Branch)

- Deploys to Vercel production
- Updates production environment
- **Trigger:** Only on pushes to `main`

---

## 🔧 Configuration

### Environment Variables & Secrets

#### GitHub Secrets Required:

```yaml
# Vercel Deployment
VERCEL_TOKEN                          # Vercel API token
VERCEL_ORG_ID                         # Vercel organization ID
VERCEL_PROJECT_ID                     # Vercel project ID

# Frontend Configuration
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID  # WalletConnect project ID

# Contract Deployment (Optional)
PRIVATE_KEY                           # Deployer private key
SEPOLIA_RPC_URL                       # Sepolia RPC endpoint
ETHERSCAN_API_KEY                     # Etherscan API key
```

#### Public Environment Variables:

```yaml
NEXT_PUBLIC_CONTRACT_ADDRESS: "0x6Be5E20244cCAF9cBf47E6Af39933C5E7aC8c12c"
NEXT_PUBLIC_CHAIN_ID: "11155111"
NEXT_PUBLIC_SEPOLIA_RPC_URL: "https://rpc.sepolia.org"
```

---

## 📁 Workflow Files

```
.github/
└── workflows/
    ├── contracts-ci.yml    # Smart contract CI pipeline
    └── frontend-ci.yml     # Frontend CI/CD pipeline
```

---

## 🚀 Setting Up CI/CD

### Step 1: Fork/Clone Repository

```bash
git clone <repository-url>
cd transit-analytics
```

### Step 2: Configure GitHub Secrets

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add the following secrets:

**Vercel Secrets:**

```bash
# Get from Vercel Dashboard → Settings → Tokens
VERCEL_TOKEN=<your-vercel-token>

# Get from Vercel project settings
VERCEL_ORG_ID=<your-org-id>
VERCEL_PROJECT_ID=<your-project-id>
```

**WalletConnect:**

```bash
# Get from https://cloud.walletconnect.com
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<your-project-id>
```

**Contract Deployment (Optional):**

```bash
PRIVATE_KEY=<deployer-private-key>
SEPOLIA_RPC_URL=<sepolia-rpc-url>
ETHERSCAN_API_KEY=<etherscan-api-key>
```

### Step 3: Push to GitHub

```bash
git add .
git commit -m "Initial commit with CI/CD"
git push origin main
```

**CI/CD will automatically run!** 🎉

---

## 📊 Workflow Status Badges

Add these badges to your README.md:

```markdown
![Smart Contract CI](https://github.com/<username>/<repo>/workflows/Smart%20Contract%20CI/badge.svg)
![Frontend CI/CD](https://github.com/<username>/<repo>/workflows/Frontend%20CI%2FCD/badge.svg)
```

---

## 🎯 CI/CD Pipeline Flow

### On Pull Request:

```
┌─────────────────────────────────────────────────────┐
│                  Pull Request Created                │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌───────────────┐         ┌──────────────┐
│   Contract CI │         │ Frontend CI  │
├───────────────┤         ├──────────────┤
│ 1. Lint       │         │ 1. Lint      │
│ 2. Compile    │         │ 2. Build     │
│ 3. Test       │         │ 3. Test      │
│ 4. Coverage   │         │ 4. Preview   │
│ 5. Gas Report │         │    Deploy    │
│ 6. Security   │         └──────┬───────┘
└───────────────┘                │
                                 ▼
                    ┌────────────────────────┐
                    │ Comment PR with        │
                    │ Preview URL            │
                    └────────────────────────┘
```

### On Push to Main:

```
┌─────────────────────────────────────────────────────┐
│                 Push to Main Branch                  │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌───────────────┐         ┌──────────────┐
│   Contract CI │         │ Frontend CI  │
├───────────────┤         ├──────────────┤
│ 1. Lint       │         │ 1. Lint      │
│ 2. Compile    │         │ 2. Build     │
│ 3. Test       │         │ 3. Test      │
│ 4. Coverage   │         │ 4. Production│
│ 5. Gas Report │         │    Deploy    │
│ 6. Security   │         └──────┬───────┘
└───────────────┘                │
                                 ▼
                    ┌────────────────────────┐
                    │ Live on Vercel         │
                    │ Production URL         │
                    └────────────────────────┘
```

---

## 🧪 Local Testing Before Push

### Test Smart Contracts:

```bash
# Run all tests
npm test

# Run with coverage
npm run coverage

# Check gas usage
REPORT_GAS=true npm test

# Compile contracts
npm run compile
```

### Test Frontend:

```bash
cd frontend

# Lint
npm run lint

# Type check
npm run type-check

# Build
npm run build

# Test locally
npm run dev
```

---

## 📈 Monitoring & Reports

### Artifacts Generated:

1. **Contract Artifacts** (7 days)

   - Compiled contracts
   - TypeChain types
   - ABI files

2. **Test Results** (7 days)

   - Test output
   - Coverage reports

3. **Gas Reports** (7 days)

   - Gas consumption analysis
   - Optimization suggestions

4. **Frontend Build** (7 days)
   - Next.js build output
   - Static assets

### Access Artifacts:

1. Go to **Actions** tab in GitHub
2. Click on workflow run
3. Scroll to **Artifacts** section
4. Download desired artifact

---

## 🔒 Security Best Practices

### ✅ Implemented:

1. **Secret Management**

   - All sensitive data in GitHub Secrets
   - No hardcoded credentials
   - Environment-specific configuration

2. **Security Scanning**

   - Slither static analysis
   - npm audit for vulnerabilities
   - Automated security checks

3. **Access Control**
   - Protected branches
   - PR reviews required
   - CI checks must pass

### ⚠️ Important Notes:

- **Never commit** `.env` files
- **Always use** GitHub Secrets for sensitive data
- **Rotate tokens** regularly
- **Review** security scan results

---

## 🔄 Continuous Deployment Strategy

### Preview Deployments:

- **Trigger:** Every pull request
- **Purpose:** Test changes before merge
- **URL:** Unique Vercel preview URL
- **Lifetime:** Until PR is closed

### Production Deployments:

- **Trigger:** Push to `main` branch
- **Purpose:** Update live application
- **URL:** Production Vercel domain
- **Rollback:** Via Vercel dashboard

---

## 📝 Adding New Workflows

### Creating a New Workflow:

1. Create file in `.github/workflows/`
2. Define trigger conditions
3. Add jobs and steps
4. Test with pull request
5. Merge to main

### Example - Custom Workflow:

```yaml
name: Custom Workflow

on:
  push:
    branches: [main]

jobs:
  custom-job:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run custom script
        run: ./scripts/custom.sh
```

---

## 🐛 Troubleshooting

### Common Issues:

#### 1. Build Failing

**Problem:** "Module not found" errors
**Solution:**

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 2. Vercel Deployment Fails

**Problem:** "Invalid token" error
**Solution:**

- Regenerate Vercel token
- Update `VERCEL_TOKEN` secret

#### 3. Tests Not Running

**Problem:** Tests skipped in CI
**Solution:**

- Check test file paths
- Verify `package.json` test script
- Review workflow YAML syntax

#### 4. Coverage Upload Fails

**Problem:** Codecov upload error
**Solution:**

- Set `CODECOV_TOKEN` secret (if private repo)
- Check network connectivity
- Review Codecov configuration

---

## 🎓 Best Practices

### ✅ DO:

1. **Write Descriptive Commit Messages**

   ```bash
   git commit -m "feat: Add user authentication"
   git commit -m "fix: Resolve gas estimation bug"
   ```

2. **Create Feature Branches**

   ```bash
   git checkout -b feature/new-feature
   ```

3. **Use Pull Requests**

   - Always create PR for review
   - Wait for CI checks to pass
   - Request code review

4. **Monitor CI/CD Runs**
   - Check Actions tab regularly
   - Review failed runs
   - Fix issues promptly

### ❌ DON'T:

1. **Push Directly to Main**

   - Use pull requests instead
   - Enable branch protection

2. **Ignore Failed Tests**

   - Investigate failures
   - Fix before merging

3. **Skip Code Review**

   - Always get review
   - Address feedback

4. **Commit Secrets**
   - Use GitHub Secrets
   - Add to `.gitignore`

---

## 📚 Resources

### Documentation:

- [GitHub Actions Docs](https://docs.github.com/actions)
- [Vercel Deployment](https://vercel.com/docs/deployments/overview)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Hardhat CI/CD](https://hardhat.org/hardhat-runner/docs/guides/continuous-integration)

### Tools:

- [Slither](https://github.com/crytic/slither) - Static analysis
- [Codecov](https://about.codecov.io/) - Coverage reporting
- [Vercel CLI](https://vercel.com/docs/cli) - Deployment CLI

---

## 🎉 Summary

### CI/CD Features Implemented:

✅ **Smart Contract Pipeline**

- Automated linting, compilation, testing
- Code coverage reporting
- Gas optimization analysis
- Security scanning

✅ **Frontend Pipeline**

- Automated building and testing
- Preview deployments for PRs
- Production deployments to Vercel
- Type checking and linting

✅ **Security**

- Secret management
- Vulnerability scanning
- Protected workflows

✅ **Developer Experience**

- Fast feedback loops
- Automated deployments
- Preview environments
- Clear status reporting

---

**Created:** 2025-10-23
**Platform:** GitHub Actions
**Deployment:** Vercel
**Status:** ✅ **Production Ready**

---

<div align="center">

## 🚀 **Fully Automated CI/CD Pipeline**

**From Commit to Production in Minutes**

</div>
