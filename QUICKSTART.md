# Quick Start Guide

Get your IP Management project running in 10 minutes!

## Step 1: Get Free Accounts (2 minutes)

1. **Infura** (RPC endpoint)
   - https://infura.io → Sign up → Create project → Copy Sepolia URL

2. **Filebase** (IPFS storage)
   - https://filebase.com → Sign up → Get API Key & Secret

3. **MetaMask** (wallet)
   - Install extension → Create wallet → Switch to Sepolia testnet
   - Get testnet ETH: https://sepolia-faucet.pk910.de

## Step 2: Setup Project (3 minutes)

```bash
# Clone or open your project
cd ip_management

# Create .env file
cd backend
cp .env.example .env

# Edit .env with:
# SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
# FILEBASE_API_KEY=your_key_here
# FILEBASE_API_SECRET=your_secret_here
# WALLET_PRIVATE_KEY=your_wallet_private_key

# Install dependencies
npm install
```

## Step 3: Start Backend (Contract Auto-Deploys!) (3 minutes)

```bash
# From backend directory
npm start

# Output:
# 🚀 Starting IP Management Backend...
# ✓ Environment variables configured
# 📝 Deploying smart contract to Sepolia...
# ✓ IPRegistry deployed to: 0x1234567890abcdef...
# ✓ Updated .env file with CONTRACT_ADDRESS
# ✓ IP management backend running on http://localhost:4000
```

**That's it!** Contract deploys automatically on first run. ✨

## Step 4: Open Frontend (1 minute)

```bash
# In another terminal
cd frontend
npx http-server
# Open http://localhost:8080
# Click "Connect Wallet (MetaMask)"
# Allow connection
```

## Step 6: Test It!

1. Click "Connect Wallet" → MetaMask pops up → Approve
2. Your wallet address auto-fills
3. Upload a file and click "Register IP"
4. See transaction on [Sepolia Etherscan](https://sepolia.etherscan.io)

## Troubleshooting

**"Wallet not initialized"**
- Check WALLET_PRIVATE_KEY is set
- Ensure wallet has Sepolia ETH

**"Filebase upload failed"**
- Verify API Key and Secret
- Check credentials on Filebase dashboard

**"MetaMask not found"**
- Install MetaMask extension
- Ensure Sepolia network is added

## Next: Deploy to Production

See [DEPLOYMENT.md](DEPLOYMENT.md) for:
- Deploy backend to Railway/Render
- Deploy frontend to Vercel
- Full production guide

## Key Files

- `.env.example` - Environment template
- `backend/wallet.js` - Sepolia wallet setup
- `backend/filebaseStorage.js` - IPFS integration
- `frontend/app.js` - MetaMask connection
- `DEPLOYMENT.md` - Production deployment

---

**That's it!** Your IP management system is now running with blockchain & decentralized storage. 🚀
