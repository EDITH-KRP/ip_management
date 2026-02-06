# Architecture & Integration Guide

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Vanilla JS)                    │
│                     - MetaMask Connection                    │
│                     - IP Registration UI                     │
│                     - Search & Transfer UI                   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    HTTP/REST API
                           │
         ┌─────────────────┴─────────────────┐
         │                                   │
┌────────▼──────────┐          ┌────────────▼─────────┐
│  Express Backend  │          │  Filebase IPFS       │
│  - IP Registry    │◄────────►│  - File Storage      │
│  - Wallet Mgmt    │          │  - Gateway URLs      │
│  - File Upload    │          │  - Permanent Storage │
└────────┬──────────┘          └──────────────────────┘
         │
         │ ethers.js
         │
┌────────▼──────────────────────────┐
│   Sepolia Testnet                 │
│   - IPRegistry Smart Contract     │
│   - Server Wallet                 │
│   - Blockchain Transactions       │
└───────────────────────────────────┘
```

## Component Details

### 1. Frontend Layer (`frontend/`)

**Technology**: Vanilla JavaScript

**Key Files**:
- `index.html` - UI with wallet connection section
- `app.js` - Event handlers & MetaMask integration
- `styles.css` - Responsive styling

**Features**:
- MetaMask wallet detection & connection
- Auto-populate owner address from connected wallet
- Real-time wallet status display
- Form submissions with error handling
- JSON response pretty-printing

**API Integration**:
```
POST /api/ip/register - Upload & register IP
GET  /api/ip/search   - Search registry
GET  /api/ip/:id      - Get record details
POST /api/ip/:id/transfer - Transfer ownership
POST /api/ip/:id/license - Set license terms
GET  /api/wallet/info - Get backend wallet status
```

### 2. Backend Layer (`backend/`)

**Technology**: Node.js + Express.js

**Core Modules**:

#### `server.js` - Main Application
- Express server setup
- API endpoints
- CORS configuration
- Service initialization
- Error handling

#### `wallet.js` - Sepolia Integration
```javascript
// Key functions:
initializeWallet()           // Load private key, create wallet
getWalletAddress(wallet)     // Get wallet address
registerIPOnChain()          // Submit IP registration
transferIPOnChain()          // Submit ownership transfer
setLicenseTermsOnChain()     // Submit license terms
```

**Contract ABI** (interface for smart contract):
```solidity
registerIP(bytes32 ipHash, string metadataURI) → uint256
transferIP(uint256 id, address newOwner, string note)
setLicenseTerms(uint256 id, uint256 price, uint256 duration)
getRecord(uint256 id) → (address, uint256, bytes32, string)
```

#### `filebaseStorage.js` - IPFS Integration
```javascript
// Key functions:
uploadFile(buffer, fileName)        // Upload to Filebase
retrieveFile(cid)                   // Download from IPFS
getGatewayUrl(cid)                  // Get public gateway URL
```

**Filebase API**:
- Endpoint: `https://api.filebase.io/v1/ipfs/upload`
- Auth: Basic Auth with API Key + Secret
- Response: Contains CID (content identifier) for file

#### `registryStore.js` - Local Data Store
```javascript
// In-memory + file-based registry (JSON)
registerRecord()    // Create new IP record
searchRecords()     // Find by title/description/hash
getRecord()         // Get by ID
transferRecord()    // Update ownership
setLicense()        // Add license terms
```

**Data Structure**:
```json
{
  "id": 1,
  "title": "My Patent",
  "ipHash": "abc123...",
  "owner": "0xAddress",
  "fileCid": "bafy...",
  "gatewayUrl": "https://ipfs.filebase.io/ipfs/bafy...",
  "timestamp": "2024-02-05T10:30:00Z",
  "transfers": [
    {"from": "0xOld", "to": "0xNew", "timestamp": "...", "note": "..."}
  ],
  "licenses": [
    {"price": "1000000000000000000", "durationDays": 30, "createdAt": "..."}
  ]
}
```

### 3. Smart Contract Layer (`contracts/IPRegistry.sol`)

**Network**: Sepolia Testnet

**Key Data Structures**:
```solidity
struct IPRecord {
    address owner;           // Current IP owner
    uint256 timestamp;       // Registration time
    bytes32 ipHash;          // SHA-256 of file
    string metadataURI;      // Filebase gateway URL
    LicenseTerms[] licenses; // Available licenses
    TransferEvent[] transfers; // Ownership history
}
```

**Main Functions**:
- `registerIP()` - Register new IP with hash & metadata
- `transferIP()` - Change ownership with audit trail
- `setLicenseTerms()` - Configure license pricing
- `purchaseLatestLicense()` - Buyer payment & transfer

**Events**:
- `IPRegistered` - Emitted on registration
- `IPTransferred` - Emitted on ownership change
- `LicenseConfigured` - Emitted when license terms set
- `LicensePurchased` - Emitted when license purchased

### 4. Environment & Configuration

**`.env` File**:
```env
# Sepolia Network
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/{PROJECT_ID}
WALLET_PRIVATE_KEY=0x{64_hex_chars}
CONTRACT_ADDRESS=0x{40_hex_chars}

# Filebase
FILEBASE_API_KEY={key}
FILEBASE_API_SECRET={secret}

# Server
PORT=4000
NODE_ENV=development
```

**Environment Sources**:
1. Local: `.env` file
2. Production: Platform env vars (Railway, Render, Heroku)
3. Frontend: Uses backend API, no env vars needed

## Data Flow: IP Registration

### User Flow (Frontend)
```
1. User clicks "Connect Wallet (MetaMask)"
   ↓
2. MetaMask popup appears
   ↓
3. User approves connection
   ↓
4. Wallet address displays, auto-fills in form
   ↓
5. User fills form: title, description, selects file
   ↓
6. User clicks "Register IP"
   ↓
7. FormData sent to backend
```

### Backend Processing
```
POST /api/ip/register receives request
   ↓
1. Validate inputs (file, title, owner)
   ↓
2. Compute SHA-256 hash of file
   ↓
3. Upload to Filebase (get CID & gateway URL)
   ↓
4. Save to local registry (JSON)
   ↓
5. Register on Sepolia blockchain
   ├─ Convert hash to bytes32
   ├─ Send registerIP() transaction
   ├─ Wait for confirmation
   └─ Get transaction hash
   ↓
6. Return response with:
   ├─ Record ID
   ├─ Filebase CID & gateway URL
   ├─ Blockchain transaction hash
   └─ isDuplicate flag
```

### Blockchain Storage
```
IPRegistry Contract (Sepolia)
├─ ID → IPRecord mapping
├─ Hash → ID mapping (for duplicates)
└─ Events log
```

### File Storage
```
Filebase IPFS Network
├─ CID points to file content
└─ Publicly accessible via:
   https://ipfs.filebase.io/ipfs/{CID}
```

## Data Flow: Ownership Transfer

### User initiates transfer:
```
User enters: ID, New Owner Address, Optional Note
   ↓
POST /api/ip/{id}/transfer
   ↓
Backend updates local registry:
├─ Append transfer event
├─ Update owner field
└─ Save to JSON
   ↓
Optional: Transfer on blockchain
   ├─ Call transferIP() on contract
   ├─ Update contract owner
   └─ Emit event
   ↓
Return updated record
```

## Deployment Architecture

### Local Development
```
http://localhost:8080     ← Frontend (http-server)
        ↓
http://localhost:4000     ← Backend (Express)
        ↓
Sepolia RPC Endpoint      ← Blockchain
        ↓
Filebase API              ← IPFS Storage
```

### Production
```
https://your-frontend.vercel.app     ← Frontend
        ↓
https://your-backend.railway.app     ← Backend
        ↓
Sepolia RPC (Infura)                 ← Blockchain
        ↓
Filebase API                         ← IPFS Storage
```

## Key Integration Points

### 1. MetaMask ↔ Frontend
- `window.ethereum` global object
- `eth_accounts` - Get connected accounts
- `eth_requestAccounts` - Request connection

### 2. Frontend ↔ Backend
- REST API over HTTP
- FormData for file uploads
- JSON for responses
- CORS enabled

### 3. Backend ↔ Filebase
- HTTP multipart form upload
- Basic Auth header
- Returns JSON with CID

### 4. Backend ↔ Sepolia
- ethers.js library
- JSON-RPC via Infura
- Private key for signing
- Contract ABI for interaction

## Security Considerations

1. **Private Key Management**
   - Stored only in environment variables
   - Never logged or exposed
   - Different key for mainnet

2. **File Handling**
   - Hashed for integrity
   - Stored on decentralized IPFS
   - No local disk storage of sensitive files

3. **Contract Security**
   - Owner-only functions
   - Address validation
   - Event logging for audits

4. **Frontend Security**
   - MetaMask handles key management
   - Users control wallet connection
   - No private key transmission

## Scaling Considerations

### Mainnet Deployment
- Switch RPC endpoint to Infura mainnet
- Deploy contract to Ethereum mainnet
- Increase gas budgets
- Add security audits

### Database
- Replace JSON with PostgreSQL/MongoDB
- Add proper indexing
- Implement caching layer

### Performance
- Add rate limiting
- Implement file size limits
- Cache Filebase responses
- CDN for frontend assets

## Testing Strategy

### Unit Tests
```bash
npm test      # Backend tests in backend/tests/
```

### Integration Tests
- Manual testing with testnet
- Sepolia Etherscan verification
- Filebase upload verification

### Load Testing
- Simulate multiple concurrent registrations
- Monitor RPC endpoint rate limits
- Test database performance

---

For more details, see:
- [README.md](README.md) - Project overview
- [QUICKSTART.md](QUICKSTART.md) - Quick setup guide
- [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment
