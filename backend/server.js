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

// Initialize services
let wallet = null;
let filebaseStorage = null;

try {
  wallet = initializeWallet();
  filebaseStorage = new FilebaseStorage();
  console.log(`✓ Wallet initialized: ${getWalletAddress(wallet)}`);
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

    const { title, description, owner } = req.body;
    if (!title || !owner) {
      return res.status(400).json({ error: "title and owner are required" });
    }

    // Compute file hash
    const ipHash = computeHash(req.file.buffer);
    
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
      fileCid: fileInfo.cid,
      gatewayUrl: fileInfo.gatewayUrl
    });

    // Optionally register on blockchain
    let blockchainTx = null;
    if (wallet && !isDuplicate) {
      try {
        const metadataURI = fileInfo.gatewayUrl;
        blockchainTx = await registerIPOnChain(wallet, `0x${ipHash}`, metadataURI);
      } catch (error) {
        console.warn("Blockchain registration failed:", error.message);
        // Continue without blockchain registration
      }
    }

    return res.status(isDuplicate ? 200 : 201).json({
      record,
      isDuplicate,
      filebaseInfo: {
        cid: fileInfo.cid,
        gatewayUrl: fileInfo.gatewayUrl
      },
      blockchainTx: blockchainTx || null
    });
  } catch (error) {
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
  const { newOwner, note } = req.body;
  if (!newOwner) {
    return res.status(400).json({ error: "newOwner is required" });
  }

  const record = transferRecord({
    id: Number(req.params.id),
    newOwner,
    note: note ?? ""
  });

  if (!record) {
    return res.status(404).json({ error: "record not found" });
  }

  return res.json({ record });
});

app.post("/api/ip/:id/license", (req, res) => {
  const { price, durationDays } = req.body;
  if (price === undefined || durationDays === undefined) {
    return res.status(400).json({ error: "price and durationDays are required" });
  }

  const record = setLicense({
    id: Number(req.params.id),
    price,
    durationDays
  });

  if (!record) {
    return res.status(404).json({ error: "record not found" });
  }

  return res.json({ record });
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

  const port = process.env.PORT ?? 4000;
  app.listen(port, () => {
    console.log(`\n✓ IP management backend running on http://localhost:${port}\n`);
  });
}

// Start the application
startup();
