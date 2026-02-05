import express from "express";
import multer from "multer";
import crypto from "crypto";

import {
  registerRecord,
  searchRecords,
  getRecord,
  transferRecord,
  setLicense
} from "./registryStore.js";

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());

const computeHash = (buffer) => crypto.createHash("sha256").update(buffer).digest("hex");

const fakeFilebaseUpload = async () => ({
  cid: `bafy${crypto.randomBytes(10).toString("hex")}`,
  gatewayUrl: "https://ipfs.filebase.io/ipfs/placeholder"
});

app.post("/api/ip/register", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "file is required" });
  }

  const { title, description, owner } = req.body;
  if (!title || !owner) {
    return res.status(400).json({ error: "title and owner are required" });
  }

  const ipHash = computeHash(req.file.buffer);
  const fileInfo = await fakeFilebaseUpload();
  const { record, isDuplicate } = registerRecord({
    title,
    description: description ?? "",
    ipHash,
    owner,
    fileCid: fileInfo.cid
  });

  return res.status(isDuplicate ? 200 : 201).json({
    record,
    isDuplicate,
    filebaseGateway: fileInfo.gatewayUrl
  });
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

const port = process.env.PORT ?? 4000;
app.listen(port, () => {
  console.log(`IP management backend running on port ${port}`);
});
