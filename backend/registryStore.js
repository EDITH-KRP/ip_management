import fs from "fs";
import path from "path";

const dataPath = path.resolve(process.env.REGISTRY_PATH ?? "./data/registry.json");

const defaultState = {
  lastId: 0,
  records: []
};

const ensureStore = () => {
  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(path.dirname(dataPath), { recursive: true });
    fs.writeFileSync(dataPath, JSON.stringify(defaultState, null, 2));
  }
};

const loadStore = () => {
  ensureStore();
  const raw = fs.readFileSync(dataPath, "utf-8");
  return JSON.parse(raw);
};

const saveStore = (data) => {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
};

export const registerRecord = ({ title, description, ipHash, owner, fileCid }) => {
  const store = loadStore();
  const existing = store.records.find((record) => record.ipHash === ipHash);
  if (existing) {
    return { record: existing, isDuplicate: true };
  }

  const record = {
    id: ++store.lastId,
    title,
    description,
    ipHash,
    owner,
    fileCid,
    timestamp: new Date().toISOString(),
    transfers: [],
    licenses: []
  };

  store.records.push(record);
  saveStore(store);
  return { record, isDuplicate: false };
};

export const searchRecords = (query) => {
  const store = loadStore();
  const normalized = query.toLowerCase();
  return store.records.filter((record) =>
    [record.title, record.description, record.ipHash].some((value) =>
      value.toLowerCase().includes(normalized)
    )
  );
};

export const getRecord = (id) => {
  const store = loadStore();
  return store.records.find((record) => record.id === id);
};

export const transferRecord = ({ id, newOwner, note }) => {
  const store = loadStore();
  const record = store.records.find((item) => item.id === id);
  if (!record) {
    return null;
  }

  record.transfers.push({
    from: record.owner,
    to: newOwner,
    note,
    timestamp: new Date().toISOString()
  });
  record.owner = newOwner;
  saveStore(store);
  return record;
};

export const setLicense = ({ id, price, durationDays }) => {
  const store = loadStore();
  const record = store.records.find((item) => item.id === id);
  if (!record) {
    return null;
  }

  record.licenses.push({
    price,
    durationDays,
    createdAt: new Date().toISOString()
  });
  saveStore(store);
  return record;
};
