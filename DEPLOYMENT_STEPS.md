# Step-by-Step Deployment Guide

Complete walkthrough to deploy your IP Management system to production.

## Phase 1: Prerequisites (15 minutes)

### 1.1 Create Accounts

**A) Infura Account for Sepolia RPC**
- Go to https://infura.io
- Click "Sign up"
- Create account with email
- Click "Create new API key"
- Name: "IP Management"
- Network: Ethereum
- In Dashboard, select your project
- Copy Sepolia Endpoint: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`

**B) Filebase Account for IPFS**
- Go to https://filebase.com
- Sign up → Verify email
- Navigate to API Credentials
- Copy API Key
- Copy API Secret
- Save these securely

**C) MetaMask Wallet Setup**
- Install MetaMask browser extension
- Create new wallet or import existing
- Copy Private Key from Settings → Account Details
  ⚠️ **Warning: Never share this key!**
- Network: Switch to Sepolia Testnet
- Get testnet ETH from: https://sepolia-faucet.pk910.de
  (Send ETH to your wallet address)

**D) GitHub Account**
- https://github.com (if don't have one)
- Create repository for your project

### 1.2 Prepare Local Project

```bash
# Navigate to project directory
cd p:\ip_management

# Initialize Git (if not already)
git init

# Create .gitignore (already done, verify it has .env)

# Create backend/.env file
cd backend
copy .env.example .env
# Edit .env with your credentials:
#   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_ID
#   FILEBASE_API_KEY=your_key
#   FILEBASE_API_SECRET=your_secret
#   WALLET_PRIVATE_KEY=0x...

# Install dependencies
npm install
```

---

## Phase 2: Deploy Smart Contract (10 minutes)

### 2.1 Compile and Deploy

```bash
# From project root
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox ethers

# Compile contract
npx hardhat compile

# Deploy to Sepolia
npx hardhat run contracts/deploy.js --network sepolia
```

**Expected Output:**
```
Deploying IPRegistry contract to Sepolia...
✓ IPRegistry deployed to: 0x1234567890abcdef...

Important: Add this to your .env file:
CONTRACT_ADDRESS=0x1234567890abcdef...
```

### 2.2 Update .env

```bash
# In backend/.env, add the contract address:
CONTRACT_ADDRESS=0x1234567890abcdef...
```

### 2.3 Verify on Etherscan (Optional)

- Go to https://sepolia.etherscan.io
- Search for your contract address
- View contract details
- Confirm deployment was successful

---

## Phase 3: Test Backend Locally (5 minutes)

```bash
# From backend directory
npm start

# Expected output:
# ✓ Wallet initialized: 0x...
# ✓ Filebase storage initialized
# IP management backend running on port 4000
```

**Test API:**
```bash
# In another terminal
curl http://localhost:4000/api/wallet/info

# Should return:
# {
#   "address": "0x...",
#   "network": "Sepolia Testnet",
#   "status": "connected"
# }
```

---

## Phase 4: Deploy Backend to Production (10 minutes)

### Option A: Railway (Easiest - Recommended)

**Step 1: Create Railway Account**
- Go to https://railway.app
- Sign up with GitHub
- Connect to GitHub account

**Step 2: Push Code to GitHub**
```bash
# From project root
git add .
git commit -m "Initial IP Management deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ip_management.git
git push -u origin main
```

**Step 3: Deploy on Railway**
- Open https://railway.app dashboard
- Click "New Project"
- Select "Deploy from GitHub repo"
- Select your `ip_management` repository
- Click "Deploy"
- Wait for build to complete

**Step 4: Configure Environment Variables**
- In Railway project, go to "Variables"
- Add each variable from your `.env`:
  - SEPOLIA_RPC_URL
  - WALLET_PRIVATE_KEY
  - CONTRACT_ADDRESS
  - FILEBASE_API_KEY
  - FILEBASE_API_SECRET
  - NODE_ENV: production
  - PORT: 4000

**Step 5: Set Start Command**
- In Railway Settings
- Build Command: `cd backend && npm install`
- Start Command: `cd backend && npm start`

**Step 6: Get Backend URL**
- Railway generates URL like: `https://your-project.railway.app`
- Copy this URL - you'll need it for frontend

---

### Option B: Render

**Step 1: Create Render Account**
- Go to https://render.com
- Sign up with GitHub

**Step 2: Create Web Service**
- Click "New +"
- Select "Web Service"
- Connect GitHub repo
- Select `ip_management` repo

**Step 3: Configure**
- Name: `ip-management-backend`
- Environment: `Node`
- Region: Choose closest
- Build Command: `cd backend && npm install`
- Start Command: `cd backend && npm start`

**Step 4: Add Environment Variables**
- Add all variables from `.env`

**Step 5: Deploy**
- Click "Create Web Service"
- Wait for deployment
- Copy the generated URL

---

### Option C: Heroku

**Step 1: Install Heroku CLI**
- Download from https://devcenter.heroku.com/articles/heroku-cli

**Step 2: Login & Create App**
```bash
heroku login
heroku create ip-management-backend
```

**Step 3: Set Environment Variables**
```bash
heroku config:set SEPOLIA_RPC_URL=https://...
heroku config:set WALLET_PRIVATE_KEY=0x...
heroku config:set CONTRACT_ADDRESS=0x...
heroku config:set FILEBASE_API_KEY=...
heroku config:set FILEBASE_API_SECRET=...
```

**Step 4: Deploy**
```bash
git push heroku main
```

**Step 5: Get URL**
```bash
heroku open  # Opens your app
# URL format: https://ip-management-backend.herokuapp.com
```

---

## Phase 5: Deploy Frontend to Production (10 minutes)

### Vercel (Recommended)

**Step 1: Create Vercel Account**
- Go to https://vercel.com
- Sign up with GitHub

**Step 2: Import Project**
- Click "Add New..."
- Select "Project"
- Select your GitHub repository
- Click "Import"

**Step 3: Configure Build**
- Framework Preset: Other
- Root Directory: (leave empty)
- Build Command: (leave empty)
- Output Directory: `frontend`

**Step 4: Environment Variables**
- Add variable:
  - Key: `VITE_API_BASE`
  - Value: `https://your-backend.railway.app` (your backend URL)

**Step 5: Deploy**
- Click "Deploy"
- Wait for build
- Copy the frontend URL: `https://your-app.vercel.app`

**Step 6: Update API Configuration**
- Edit `frontend/app.js`
- Change: `const apiBase = "http://localhost:4000"`
- To: `const apiBase = "https://your-backend.railway.app"`
- Push changes: 
  ```bash
  git add frontend/app.js
  git commit -m "Update backend API URL"
  git push origin main
  ```
- Vercel auto-redeploys

---

## Phase 6: Final Testing (10 minutes)

### 6.1 Test Backend

```bash
# Replace URL with your backend
curl https://your-backend.railway.app/api/wallet/info

# Should return wallet status
```

### 6.2 Test Frontend

1. Open https://your-app.vercel.app
2. Check for page load
3. Should show "Disconnected" in wallet status

### 6.3 Test Wallet Connection

1. Click "Connect Wallet (MetaMask)"
2. MetaMask popup should appear
3. Click "Connect"
4. Wallet address should display
5. Status should change to "Connected"

### 6.4 Test IP Registration

1. Fill in IP details:
   - Title: "Test Patent"
   - Owner: (should be auto-filled)
   - Description: "Test description"
   - File: Choose any small file

2. Click "Register IP"

3. Check response:
   - Should show record details
   - Should show Filebase CID
   - Should show blockchain transaction hash

4. Verify on Etherscan:
   - Go to https://sepolia.etherscan.io
   - Search for transaction hash
   - Confirm transaction status

### 6.5 Test Search

1. Go to "Public IP Registry" section
2. Enter search term (from title you registered)
3. Click "Search"
4. Should return your registered IP

---

## Phase 7: Post-Deployment (5 minutes)

### 7.1 Document Your URLs

Create `DEPLOYMENT_URLS.txt`:
```
Frontend: https://your-app.vercel.app
Backend: https://your-backend.railway.app
Smart Contract: https://sepolia.etherscan.io/address/0x...
Filebase Dashboard: https://filebase.com
```

### 7.2 Setup Monitoring

**Backend Logs:**
- Railway: Dashboard → Deployments → Logs
- Render: Dashboard → Logs
- Heroku: `heroku logs --tail`

**Frontend Logs:**
- Vercel: Dashboard → Deployments → Logs

### 7.3 Enable Auto-Deploy

All platforms automatically deploy when you push to GitHub:
```bash
git push origin main
# Your changes are live within 2-5 minutes
```

---

## Phase 8: Troubleshooting

### Backend Won't Start

**Error: "Wallet not initialized"**
```bash
# Check Railway variables are set
# Verify SEPOLIA_RPC_URL is correct
# Verify WALLET_PRIVATE_KEY format (0x prefix)
```

**Error: "FILEBASE credentials missing"**
```bash
# Add to Railway/Render environment:
FILEBASE_API_KEY=your_key
FILEBASE_API_SECRET=your_secret
```

### Frontend Shows "Error connecting to backend"

**Solution:**
1. Verify backend is running
2. Check frontend API URL matches backend URL
3. Verify CORS is enabled on backend
4. Check browser console for errors (F12)

### MetaMask Won't Connect

**Solution:**
1. Ensure MetaMask extension is installed
2. Switch to Sepolia testnet in MetaMask
3. Refresh page and try again
4. Check browser console

### Transaction Fails

**Solution:**
1. Ensure wallet has Sepolia testnet ETH
2. Get more ETH from faucet
3. Check gas prices on Etherscan
4. Verify contract address is correct

---

## Success Checklist

- [x] All accounts created (Infura, Filebase, GitHub)
- [x] Smart contract deployed to Sepolia
- [x] Backend deployed to production
- [x] Frontend deployed to Vercel
- [x] Wallet connection working
- [x] IP registration working
- [x] Files uploading to Filebase
- [x] Transactions visible on Etherscan

## Next Steps

1. **Add mainnet support** for production use
2. **Implement database** (MongoDB/PostgreSQL) for scaling
3. **Add rate limiting** to prevent abuse
4. **Set up monitoring** for uptime
5. **Add CI/CD pipelines** for automated testing
6. **Get smart contract audited** before mainnet

---

**Congratulations!** Your IP Management system is now live! 🎉

For more help:
- [README.md](README.md) - Project overview
- [ARCHITECTURE.md](ARCHITECTURE.md) - Technical details
- [QUICKSTART.md](QUICKSTART.md) - Quick reference
