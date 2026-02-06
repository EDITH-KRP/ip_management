# Immutable IP Management

Prototype for an immutable IP registry with on-chain hashes, public discovery, ownership transfers, and licensing. Integrated with Sepolia testnet and Filebase for production-ready IPFS storage.

## What is Included

- **Smart contract** (`contracts/IPRegistry.sol`)
  - Register IP hashes on Sepolia testnet
  - Transfer ownership + history
  - Configure and purchase license terms
  
- **Backend API** (`backend/server.js`)
  - File uploads + SHA-256 hashing
  - **Real Filebase/IPFS integration** for file storage
  - **Server-side Sepolia wallet** for blockchain transactions
  - Local registry store with gateway URLs
  - CORS enabled for frontend integration
  
- **Frontend** (`frontend/`)
  - **MetaMask wallet connection**
  - Register IP, search registry, transfer ownership, set license terms
  - Real-time blockchain integration
  - Showcase advanced feature roadmap

## New Features

✅ **Sepolia Testnet Integration**
- Server-side wallet for automated IP registration
- Real blockchain transactions with eth storage

✅ **Filebase IPFS Storage**
- Upload files to decentralized IPFS network
- Get permanent gateway URLs for file access
- No fake uploads - real storage

✅ **MetaMask Wallet Connection**
- Connect directly from browser
- Auto-populate wallet address
- View connected network and balance

✅ **Production Deployment Ready**
- Docker support
- Railway/Render/Heroku configuration
- Vercel frontend deployment
- Environment-based configuration

## Running Locally

### Prerequisites
- Node.js 16+
- MetaMask browser extension
- Sepolia testnet ETH (from [faucet](https://sepolia-faucet.pk910.de))

### Setup

1. **Configure environment** (`backend/.env`):
```bash
cp backend/.env.example backend/.env
# Edit .env with your:
# - SEPOLIA_RPC_URL (from Infura)
# - WALLET_PRIVATE_KEY (server wallet)
# - FILEBASE_API_KEY & SECRET
```

2. **Install backend dependencies**:
```bash
cd backend
npm install
```

3. **Start backend** (contract auto-deploys!):
```bash
npm start
# First run deploys contract, updates .env, then starts server
# http://localhost:4000
```

4. **Open frontend** (in another terminal):
```bash
cd frontend
npx http-server
# Open http://localhost:8080
```

5. **Connect wallet**:
   - Click "Connect Wallet (MetaMask)"
   - Approve connection
   - Start registering IP!

## Running Backend Tests

```bash
cd backend
npm test
```

## Deployment

Complete deployment guide available in [DEPLOYMENT.md](DEPLOYMENT.md)

Quick summary:
- **Backend**: Railway, Render, or Heroku
- **Frontend**: Vercel
- **Smart Contract**: Sepolia testnet
- **Files**: Filebase IPFS

### Deploy in 5 minutes:
1. Create accounts: Infura, Filebase, Railway, Vercel
2. Deploy contract: `npx hardhat run contracts/deploy.js --network sepolia`
3. Set environment variables on Railway & Vercel
4. Push to GitHub and auto-deploy

## Next Steps

- Add mainnet support for production
- Implement AI similarity detection
- Add dispute resolution flow
- Integrate licensing payment splits
- Add NFT minting for licenses
- Implement web3 royalty splits

## Architecture

```
IP Management Project
├── Smart Contract (Solidity)
│   └── Sepolia Testnet
├── Backend (Express.js)
│   ├── Wallet Integration (ethers.js)
│   └── Filebase Storage
├── Frontend (Vanilla JS)
│   └── MetaMask Connection
└── Deployment
    ├── Railway/Render (Backend)
    └── Vercel (Frontend)
```

## Security Notes

- Server wallet private key stored securely in environment
- Frontend uses MetaMask for user authentication
- CORS enabled for frontend origin
- Never commit `.env` files
- Use separate testnet wallet for development

## License

MIT
