import express from "express";
import multer from "multer";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cors from "cors";

import {
  registerRecord,
  searchRecords,
  getRecord,
  transferRecord,
  setLicense
} from "./registryStore.js";
import { initializeWallet, getWalletAddress, registerIPOnChain } from "./wallet.js";
import FilebaseStorage from "./filebaseStorage.js";
import { initializeContract, checkRequirements } from "./initializeContract.js";

dotenv.config();

// Startup initialization
async function startup() {
  console.log("\n🚀 Starting IP Management Backend...\n");

  // Check environment requirements
  if (!checkRequirements()) {
    process.exit(1);
  }

  console.log("✓ Environment variables configured\n");

  // Initialize smart contract (deploy if needed)
  const contractReady = await initializeContract();
  if (!contractReady) {
    console.warn("⚠️  Continuing without contract. Some features may be limited.\n");
  }

  startServer();
}

function startServer() {const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "../frontend")));

const computeHash = (buffer) => crypto.createHash("sha256").update(buffer).digest("hex");

// Transaction logging
const transactionLog = [];
function logTransaction(type, details) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    type,
    details
  };
  transactionLog.push(logEntry);
  console.log(`📝 [LOG] ${type}:`, JSON.stringify(logEntry));
  return logEntry;
}

// Initialize services
let wallet = null;
let filebaseStorage = null;
let walletAddress = null;

try {
  const walletData = initializeWallet();
  wallet = walletData.wallet;
  walletAddress = getWalletAddress(wallet);
  filebaseStorage = new FilebaseStorage();
  console.log(`✓ Wallet initialized: ${walletAddress}`);
  console.log(`✓ Filebase storage initialized`);
} catch (error) {
  console.warn(`⚠ Service initialization warning: ${error.message}`);
  console.warn("Proceeding with limited functionality. Some features may not work.");
}

app.post("/api/ip/register", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "file is required" });
    }

    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ error: "title is required" });
    }

    // Use server wallet as owner for all registrations
    const owner = walletAddress || "server-wallet";

    // Compute file hash
    const ipHash = computeHash(req.file.buffer);
    
    // Log the transaction
    logTransaction("IP_REGISTRATION_INITIATED", {
      title,
      fileHash: ipHash,
      fileSize: req.file.size,
      fileName: req.file.originalname,
      owner: owner
    });
    
    // Upload to Filebase
    let fileInfo = null;
    if (filebaseStorage) {
      fileInfo = await filebaseStorage.uploadFile(req.file.buffer, req.file.originalname);
    } else {
      fileInfo = {
        cid: `placeholder-${crypto.randomBytes(5).toString("hex")}`,
        gatewayUrl: "https://ipfs.filebase.io/ipfs/placeholder"
      };
    }

    // Register in local store
    const { record, isDuplicate } = registerRecord({
      title,
      description: description ?? "",
      ipHash,
      owner,
      fileCic: fileInfo.cid,
      gatewayUrl: fileInfo.gatewayUrl
    });

    // Log successful registration
    logTransaction("IP_REGISTRATION_COMPLETED", {
      recordId: record.id,
      title,
      ipHash,
      fileCid: fileInfo.cid,
      isDuplicate,
      gatewayUrl: fileInfo.gatewayUrl
    });

    // Optionally register on blockchain
    let blockchainTx = null;
    if (wallet && !isDuplicate) {
      try {
        const metadataURI = fileInfo.gatewayUrl;
        blockchainTx = await registerIPOnChain(wallet, `0x${ipHash}`, metadataURI);
        
        logTransaction("BLOCKCHAIN_REGISTRATION_SUCCESS", {
          recordId: record.id,
          transactionHash: blockchainTx.transactionHash,
          blockNumber: blockchainTx.blockNumber
        });
      } catch (error) {
        console.warn("Blockchain registration failed:", error.message);
        logTransaction("BLOCKCHAIN_REGISTRATION_FAILED", {
          recordId: record.id,
          error: error.message
        });
        // Continue without blockchain registration
      }
    }

    return res.status(isDuplicate ? 200 : 201).json({
      success: true,
      message: isDuplicate ? "IP already registered" : "IP registered successfully",
      record,
      isDuplicate,
      processedBy: walletAddress ? "Server Wallet" : "Local Storage Only",
      filebaseInfo: {
        cid: fileInfo.cid,
        gatewayUrl: fileInfo.gatewayUrl
      },
      blockchainTx: blockchainTx || null,
      auditNote: "All transactions logged on server for security and audit purposes"
    });
  } catch (error) {
    logTransaction("IP_REGISTRATION_ERROR", {
      error: error.message,
      stack: error.stack
    });
    console.error("Registration error:", error);
    return res.status(500).json({ error: error.message || "Registration failed" });
  }
});

app.get("/api/ip/search", (req, res) => {
  const query = req.query.q?.toString() ?? "";
  if (!query) {
    return res.json({ results: [] });
  }

  return res.json({ results: searchRecords(query) });
});

app.get("/api/ip/:id", (req, res) => {
  const record = getRecord(Number(req.params.id));
  if (!record) {
    return res.status(404).json({ error: "record not found" });
  }

  return res.json({ record });
});

app.post("/api/ip/:id/transfer", (req, res) => {
  try {
    const { newOwner, note } = req.body;
    if (!newOwner) {
      return res.status(400).json({ error: "newOwner is required" });
    }

    const recordId = Number(req.params.id);
    
    // Log transfer request
    logTransaction("OWNERSHIP_TRANSFER_INITIATED", {
      recordId,
      previousOwner: walletAddress,
      newOwner,
      note: note ?? ""
    });

    const record = transferRecord({
      id: recordId,
      newOwner,
      note: note ?? ""
    });

    if (!record) {
      logTransaction("OWNERSHIP_TRANSFER_FAILED", {
        recordId,
        error: "record not found"
      });
      return res.status(404).json({ error: "record not found" });
    }

    // Log successful transfer
    logTransaction("OWNERSHIP_TRANSFER_COMPLETED", {
      recordId,
      newOwner,
      note: note ?? ""
    });

    return res.json({
      success: true,
      message: "Ownership transfer processed",
      record,
      processedBy: walletAddress ? "Server Wallet" : "Local Storage Only",
      auditNote: "Transfer has been logged and recorded on the server"
    });
  } catch (error) {
    logTransaction("OWNERSHIP_TRANSFER_ERROR", {
      recordId: req.params.id,
      error: error.message
    });
    return res.status(500).json({ error: error.message || "Transfer failed" });
  }
});

app.post("/api/ip/:id/license", (req, res) => {
  try {
    const { price, durationDays } = req.body;
    if (price === undefined || durationDays === undefined) {
      return res.status(400).json({ error: "price and durationDays are required" });
    }

    const recordId = Number(req.params.id);

    // Log license setting
    logTransaction("LICENSE_TERMS_INITIATED", {
      recordId,
      price,
      durationDays
    });

    const record = setLicense({
      id: recordId,
      price,
      durationDays
    });

    if (!record) {
      logTransaction("LICENSE_TERMS_FAILED", {
        recordId,
        error: "record not found"
      });
      return res.status(404).json({ error: "record not found" });
    }

    // Log successful license configuration
    logTransaction("LICENSE_TERMS_COMPLETED", {
      recordId,
      price,
      durationDays
    });

    return res.json({
      success: true,
      message: "License terms configured",
      record,
      processedBy: walletAddress ? "Server Wallet" : "Local Storage Only",
      auditNote: "License configuration has been logged and recorded on the server"
    });
  } catch (error) {
    logTransaction("LICENSE_TERMS_ERROR", {
      recordId: req.params.id,
      error: error.message
    });
    return res.status(500).json({ error: error.message || "Failed to set license" });
  }
});

// Wallet info endpoint
app.get("/api/wallet/info", (req, res) => {
  if (!wallet) {
    return res.status(503).json({ error: "Wallet not initialized" });
  }

  return res.json({
    address: getWalletAddress(wallet),
    network: "Sepolia Testnet",
    status: "connected"
  });
});

// Transaction audit log endpoint
app.get("/api/audit/transactions", (req, res) => {
  return res.json({
    totalTransactions: transactionLog.length,
    transactions: transactionLog.slice(-100), // Return last 100 transactions
    note: "All transactions are logged on the server for security and audit purposes"
  });
});

  const port = process.env.PORT ?? 4000;
  app.listen(port, () => {
    console.log(`\n✓ IP management backend running on http://localhost:${port}\n`);
  });
}

// Start the application
startup();
