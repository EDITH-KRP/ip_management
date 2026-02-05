# Immutable IP Management

Prototype for an immutable IP registry with on-chain hashes, public discovery, ownership transfers, and licensing.

## What is Included

- **Smart contract** (`contracts/IPRegistry.sol`)
  - Register IP hashes
  - Transfer ownership + history
  - Configure and purchase license terms
- **Backend API** (`backend/server.js`)
  - File uploads + hashing
  - Local registry store (JSON)
  - Placeholder IPFS/Filebase upload handler
- **Frontend** (`frontend/`)
  - Register IP, search registry, transfer ownership, set license terms
  - Showcase advanced feature roadmap

## Running the Prototype

```bash
cd backend
npm install
npm start
```

Run backend tests:

```bash
cd backend
npm test
```

Open `frontend/index.html` in a browser and ensure the backend runs on `http://localhost:4000`.

## Next Steps

- Replace `fakeFilebaseUpload` with real Filebase/IPFS integration.
- Add blockchain integration with Web3/ethers to submit `registerIP`, `transferIP`, and `setLicenseTerms` transactions.
- Integrate an AI similarity model for pre-registration duplicate detection.
- Add dispute resolution flow, licensing payment splits, and NFT minting.
