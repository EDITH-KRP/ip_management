import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

let storeModule;
let registryPath;

beforeEach(async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ip-registry-"));
  registryPath = path.join(tmpDir, "registry.json");
  process.env.REGISTRY_PATH = registryPath;
  storeModule = await import(`../registryStore.js?cacheBust=${Date.now()}`);
});

test("registerRecord stores new record and prevents duplicates", () => {
  const { registerRecord } = storeModule;

  const first = registerRecord({
    title: "Blueprint A",
    description: "Test doc",
    ipHash: "hash-123",
    owner: "0xabc",
    fileCid: "cid-1"
  });
  assert.equal(first.isDuplicate, false);
  assert.equal(first.record.id, 1);

  const duplicate = registerRecord({
    title: "Blueprint A",
    description: "Test doc",
    ipHash: "hash-123",
    owner: "0xabc",
    fileCid: "cid-1"
  });
  assert.equal(duplicate.isDuplicate, true);
  assert.equal(duplicate.record.id, 1);
});

test("transferRecord updates owner and records history", () => {
  const { registerRecord, transferRecord } = storeModule;

  const { record } = registerRecord({
    title: "Blueprint B",
    description: "Another doc",
    ipHash: "hash-456",
    owner: "0x123",
    fileCid: "cid-2"
  });

  const updated = transferRecord({ id: record.id, newOwner: "0x999", note: "Sale" });
  assert.equal(updated.owner, "0x999");
  assert.equal(updated.transfers.length, 1);
  assert.equal(updated.transfers[0].from, "0x123");
});

test("setLicense adds license terms", () => {
  const { registerRecord, setLicense } = storeModule;

  const { record } = registerRecord({
    title: "Blueprint C",
    description: "License doc",
    ipHash: "hash-789",
    owner: "0x777",
    fileCid: "cid-3"
  });

  const updated = setLicense({ id: record.id, price: "100", durationDays: "30" });
  assert.equal(updated.licenses.length, 1);
  assert.equal(updated.licenses[0].price, "100");
});
