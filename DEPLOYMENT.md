# Deployment Guide: IP Management Project

## Overview

This guide covers deploying the IP Management project with:
- **Sepolia Testnet** for blockchain operations
- **Filebase** for IPFS file storage
- **MetaMask Wallet** for frontend authentication
- **Backend Server** on Railway/Render/Heroku
- **Frontend** on Vercel

---

## Part 1: Setup Prerequisites

### 1.1 Create Required Accounts

1. **Infura Account** (for Sepolia RPC):
   - Go to [https://infura.io](https://infura.io)
   - Sign up for a free account
   - Create a new project
   - Copy your Sepolia RPC endpoint: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`

2. **Filebase Account** (for IPFS storage):
   - Go to [https://filebase.com](https://filebase.com)
   - Sign up for a free account
   - Generate API Key and API Secret from the dashboard

3. **MetaMask Wallet**:
   - Install MetaMask extension from [https://metamask.io](https://metamask.io)
   - Create a wallet or import existing one
   - Switch to **Sepolia Testnet**
   - Get testnet ETH from faucet: [https://sepolia-faucet.pk910.de](https://sepolia-faucet.pk910.de)

4. **Etherscan Account** (optional, for contract verification):
   - Go to [https://sepolia.etherscan.io](https://sepolia.etherscan.io)
   - Sign up and get API key for contract verification

---

## Part 2: Local Development Setup

### 2.1 Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install Hardhat and deployment tools (run from project root)
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @nomicfoundation/hardhat-ethers ethers dotenv
```

### 2.2 Configure Environment Variables

Create `.env` file in `backend/` directory:

```env
# Sepolia Network Configuration
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
WALLET_PRIVATE_KEY=your_private_key_here
CONTRACT_ADDRESS=your_deployed_contract_address

# Filebase Configuration
FILEBASE_API_KEY=your_filebase_api_key
FILEBASE_API_SECRET=your_filebase_api_secret

# Server Configuration
PORT=4000
NODE_ENV=development
```

⚠️ **Important**: Never commit `.env` to git. Add it to `.gitignore`.

### 2.3 Deploy Smart Contract to Sepolia

```bash
# Compile the contract
npx hardhat compile

# Deploy to Sepolia testnet
npx hardhat run contracts/deploy.js --network sepolia
```

Copy the deployed contract address and add it to your `.env` file.

### 2.4 Run Backend Locally

```bash
cd backend
npm start
# Server runs on http://localhost:4000
```

### 2.5 Run Frontend Locally

Open `frontend/index.html` in your browser or serve it:

```bash
# Using Node's http-server
npx http-server frontend/

# Or using Python
python -m http.server 8000 --directory frontend/
```

---

## Part 3: Deploying Backend to Production

### Option A: Railway (Recommended - Easiest)

1. **Sign up** at [https://railway.app](https://railway.app)

2. **Push code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

3. **Connect Railway to GitHub**:
   - Create new project in Railway
   - Select "Deploy from GitHub"
   - Connect your repository
   - Select the repo

4. **Set environment variables** in Railway:
   - Go to Variables tab
   - Add all variables from your `.env` file

5. **Configure start command**:
   - In Railway settings, set Start Command: `cd backend && npm install && npm start`

6. **Deploy**:
   - Railway auto-deploys on push
   - Copy the generated URL (e.g., `https://your-project.railway.app`)

### Option B: Render

1. **Sign up** at [https://render.com](https://render.com)

2. **Create Web Service**:
   - Connect GitHub repository
   - Set Environment: Node
   - Set Build Command: `cd backend && npm install`
   - Set Start Command: `cd backend && npm start`

3. **Add Environment Variables**:
   - Add all variables from `.env` file

4. **Deploy** and note the service URL

### Option C: Heroku

1. **Install Heroku CLI** from [https://devcenter.heroku.com/articles/heroku-cli](https://devcenter.heroku.com/articles/heroku-cli)

2. **Login and Create App**:
   ```bash
   heroku login
   heroku create your-ip-management-app
   ```

3. **Set Environment Variables**:
   ```bash
   heroku config:set SEPOLIA_RPC_URL=your_rpc_url
   heroku config:set WALLET_PRIVATE_KEY=your_private_key
   heroku config:set CONTRACT_ADDRESS=your_contract_address
   heroku config:set FILEBASE_API_KEY=your_api_key
   heroku config:set FILEBASE_API_SECRET=your_api_secret
   ```

4. **Deploy**:
   ```bash
   git push heroku main
   ```

---

## Part 4: Deploying Frontend to Production

### Vercel (Recommended)

1. **Sign up** at [https://vercel.com](https://vercel.com)

2. **Import Project**:
   - Connect your GitHub repository
   - Select repository

3. **Configure**:
   - Root Directory: `.` (or leave default)
   - Build Command: (Leave empty for static files)
   - Output Directory: `frontend`

4. **Add Environment Variables**:
   - In Vercel Settings → Environment Variables
   - Add: `VITE_API_BASE=your-backend-url.railway.app` (or your backend URL)

5. **Deploy** and note the frontend URL

6. **Update frontend API URL**:
   - Edit `frontend/app.js` 
   - Change `const apiBase = "http://localhost:4000"` to your backend URL
   - Redeploy

---

## Part 5: Using Filebase IPFS Integration

### Setup Filebase

1. Get your **API Key** and **API Secret** from Filebase dashboard
2. Add to `.env`:
   ```env
   FILEBASE_API_KEY=your_api_key
   FILEBASE_API_SECRET=your_api_secret
   ```

3. The backend will automatically:
   - Upload files to IPFS via Filebase
   - Return gateway URLs for retrieval
   - Store CIDs in the registry

### Access Uploaded Files

Files are accessible via:
```
https://ipfs.filebase.io/ipfs/{CID}
```

---

## Part 6: Complete Deployment Checklist

- [ ] Created Infura account and got Sepolia RPC URL
- [ ] Created Filebase account with API Key & Secret
- [ ] Installed MetaMask and got Sepolia testnet ETH
- [ ] Created `.env` file with all variables
- [ ] Deployed smart contract to Sepolia (got contract address)
- [ ] Tested backend locally with `npm start`
- [ ] Tested frontend locally
- [ ] Pushed code to GitHub
- [ ] Deployed backend to Railway/Render/Heroku
- [ ] Updated `frontend/app.js` with backend URL
- [ ] Deployed frontend to Vercel
- [ ] Tested wallet connection on deployed frontend
- [ ] Tested IP registration with real Filebase upload
- [ ] Verified transactions on [Sepolia Etherscan](https://sepolia.etherscan.io)

---

## Part 7: Testing the Deployment

### 1. Test Backend Health
```bash
curl https://your-backend.railway.app/api/wallet/info
```

### 2. Test Frontend
- Open frontend URL in browser
- Click "Connect Wallet (MetaMask)"
- MetaMask should pop up
- Accept connection
- Wallet address should display

### 3. Test IP Registration
- Upload a file
- Check Filebase dashboard for upload
- Verify transaction on Sepolia Etherscan

### 4. View Smart Contract on Etherscan
- Go to `https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS`
- Verify contract source code (optional)
- View all transactions

---

## Part 8: Troubleshooting

### "Wallet not initialized"
- Check `WALLET_PRIVATE_KEY` and `SEPOLIA_RPC_URL` in `.env`
- Verify wallet has Sepolia testnet ETH

### "Filebase upload failed"
- Check `FILEBASE_API_KEY` and `FILEBASE_API_SECRET`
- Verify credentials on Filebase dashboard

### "MetaMask connection fails"
- Ensure Sepolia network is added to MetaMask
- Try refreshing the page
- Check browser console for errors

### "Contract not found"
- Verify `CONTRACT_ADDRESS` on Sepolia Etherscan
- Ensure contract is on Sepolia (not mainnet)

### "CORS errors"
- Backend has CORS enabled for all origins
- Ensure frontend uses correct backend URL

---

## Part 9: Security Best Practices

1. **Never commit `.env`** - Always use `.gitignore`
2. **Rotate private keys** - Generate new wallet for production
3. **Use separate testnet wallet** - Don't use mainnet keys in development
4. **Verify contract source** - On Etherscan for auditing
5. **Enable 2FA** - On all service accounts (Infura, Filebase, etc.)

---

## Part 10: Scaling & Optimization

### For Production Mainnet:
1. Move from Sepolia to Ethereum Mainnet
2. Use mainnet Infura key
3. Update smart contracts with proper security audits
4. Implement rate limiting on backend
5. Use CDN for frontend assets
6. Add database (MongoDB/PostgreSQL) instead of JSON files

### Monitor & Maintain:
- Set up error tracking (Sentry)
- Monitor backend performance
- Set up alerts for failed transactions
- Regular security audits

---

## Quick Reference: URLs

- **Sepolia Testnet**: https://sepolia.etherscan.io
- **Sepolia Faucet**: https://sepolia-faucet.pk910.de
- **MetaMask**: https://metamask.io
- **Filebase**: https://filebase.com
- **Infura**: https://infura.io
- **Vercel**: https://vercel.com
- **Railway**: https://railway.app
- **Render**: https://render.com

---

## Support

For issues, check:
1. Backend logs on Railway/Render/Heroku
2. Vercel deployment logs
3. Browser console (F12)
4. Sepolia Etherscan for contract info
5. Filebase dashboard for upload status
