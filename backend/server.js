import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "./models/User.js";
import Transaction from "./models/Transaction.js";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "aurum_dev_secret_change_me";
const STORE_PATH = path.join(__dirname, "data", "store.json");
const MONGODB_URI = process.env.MONGODB_URI || null;
const IS_VERCEL = process.env.VERCEL === "1" || process.env.VERCEL === "true";
let dbConnected = false;
let dbConnectionPromise = null;

async function ensureDbConnection() {
  if (!MONGODB_URI) return;
  if (dbConnected) return true;
  if (dbConnectionPromise) return dbConnectionPromise;

  try {
    dbConnectionPromise = mongoose.connect(MONGODB_URI).then(() => {
      dbConnected = true;
      console.log("Connected to MongoDB");
      return true;
    }).catch((err) => {
      dbConnectionPromise = null;
      dbConnected = false;
      console.warn("Could not connect to MongoDB:", err.message);
      return false;
    });
    return dbConnectionPromise;
  } catch (err) {
    dbConnectionPromise = null;
    dbConnected = false;
    console.warn("Could not connect to MongoDB:", err.message);
    return false;
  }
}

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  if (!MONGODB_URI) return next();

  ensureDbConnection()
    .then((connected) => {
      if (!connected) {
        return res.status(503).json({ message: "Database unavailable" });
      }
      next();
    })
    .catch(next);
});

app.use((req, res, next) => {
  if (IS_VERCEL && !MONGODB_URI) {
    return res.status(500).json({ message: "MONGODB_URI is required on Vercel" });
  }
  next();
});

async function readStore() {
  const raw = await fs.readFile(STORE_PATH, "utf-8");
  return JSON.parse(raw);
}

async function writeStore(store) {
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

async function getNextUserId() {
  if (dbConnected) {
    const lastUser = await User.findOne().sort({ id: -1 }).lean();
    return lastUser ? lastUser.id + 1 : 1;
  }

  const store = await readStore();
  return store.users.length ? Math.max(...store.users.map((u) => u.id)) + 1 : 1;
}

async function getNextTransactionId(userId) {
  if (dbConnected) {
    const lastTransaction = await Transaction.findOne({ userId }).sort({ id: -1 }).lean();
    return lastTransaction ? lastTransaction.id + 1 : 1;
  }

  const store = await readStore();
  const txs = store.transactions[String(userId)] || [];
  return txs.length ? Math.max(...txs.map((t) => t.id)) + 1 : 1;
}

// Helper DB-aware operations
async function getUserByEmail(email) {
  if (dbConnected) return User.findOne({ email }).lean();
  const store = await readStore();
  return store.users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
}

async function getUserById(id) {
  if (dbConnected) return User.findOne({ id }).lean();
  const store = await readStore();
  return store.users.find((u) => u.id === id);
}

async function createUser(user) {
  if (dbConnected) return User.create(user);
  const store = await readStore();
  store.users.push(user);
  store.transactions[String(user.id)] = store.transactions[String(user.id)] || [];
  await writeStore(store);
  return user;
}

async function getTransactionsForUser(userId) {
  if (dbConnected) return Transaction.find({ userId }).lean();
  const store = await readStore();
  return store.transactions[String(userId)] || [];
}

async function addTransactionForUser(userId, tx) {
  if (dbConnected) {
    const id = await getNextTransactionId(userId);
    return Transaction.create({ id, userId, ...tx });
  }
  const store = await readStore();
  const key = String(userId);
  const txs = store.transactions[key] || [];
  const nextId = txs.length ? Math.max(...txs.map((t) => t.id)) + 1 : 1;
  const nextTx = { id: nextId, ...tx };
  store.transactions[key] = [...txs, nextTx];
  await writeStore(store);
  return nextTx;
}

async function updateTransactionForUser(userId, id, updated) {
  if (dbConnected) return Transaction.findOneAndUpdate({ userId, id }, updated, { new: true }).lean();
  const store = await readStore();
  const key = String(userId);
  const txs = store.transactions[key] || [];
  const idx = txs.findIndex((t) => t.id === id);
  if (idx < 0) return null;
  txs[idx] = { ...txs[idx], ...updated };
  store.transactions[key] = txs;
  await writeStore(store);
  return txs[idx];
}

async function deleteTransactionForUser(userId, id) {
  if (dbConnected) {
    const result = await Transaction.deleteOne({ userId, id });
    return result.deletedCount > 0;
  }
  const store = await readStore();
  const key = String(userId);
  const txs = store.transactions[key] || [];
  const exists = txs.some((t) => t.id === id);
  if (!exists) return false;
  store.transactions[key] = txs.filter((t) => t.id !== id);
  await writeStore(store);
  return true;
}

function sanitizeUser(user) {
  const { password, ...safe } = user;
  return safe;
}

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Missing token" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

app.get("/api/health", (_, res) => {
  res.json({ ok: true });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await getUserByEmail(String(email).toLowerCase());
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  const match = await bcrypt.compare(String(password), String(user.password));
  if (!match) return res.status(401).json({ message: "Invalid credentials" });

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const payload = { id: user.id, role: user.role, email: user.email, name: user.name };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

  res.json({ token, user: sanitizeUser(user) });
});

app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const cleanPassword = String(password);
  const cleanName = String(name || "").trim() || cleanEmail.split("@")[0] || "Aurum User";

  if (!cleanEmail.includes("@")) {
    return res.status(400).json({ message: "Please enter a valid email" });
  }

  if (cleanPassword.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  const existsUser = await getUserByEmail(cleanEmail);
  const exists = Boolean(existsUser);
  if (exists) {
    return res.status(409).json({ message: "Account already exists for this email" });
  }

  const nextId = await getNextUserId();
  const nextUser = {
    id: nextId,
    name: cleanName,
    email: cleanEmail,
    password: await bcrypt.hash(cleanPassword, 10),
    role: "admin",
  };

  await createUser(nextUser);

  const payload = { id: nextUser.id, role: nextUser.role, email: nextUser.email, name: nextUser.name };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

  res.status(201).json({ token, user: sanitizeUser(nextUser) });
});

app.get("/api/auth/me", auth, async (req, res) => {
  const user = await getUserById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ user: sanitizeUser(user) });
});

app.get("/api/transactions", auth, async (req, res) => {
  const txs = await getTransactionsForUser(req.user.id);
  res.json({ transactions: txs });
});

app.post("/api/transactions", auth, async (req, res) => {
  const { desc, amount, date, type, cat } = req.body || {};

  if (!desc || !amount || !date || !type || !cat) {
    return res.status(400).json({ message: "desc, amount, date, type and cat are required" });
  }

  const cleanAmount = Number(amount);
  if (!Number.isFinite(cleanAmount) || cleanAmount <= 0) {
    return res.status(400).json({ message: "amount must be a positive number" });
  }

  const nextTx = {
    desc: String(desc).trim(),
    amount: cleanAmount,
    date: String(date),
    type: String(type),
    cat: String(cat),
  };

  const created = await addTransactionForUser(req.user.id, nextTx);
  res.status(201).json({ transaction: created });
});

app.put("/api/transactions/:id", auth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ message: "Invalid id" });
  }

  const { desc, amount, date, type, cat } = req.body || {};
  const cleanAmount = Number(amount);

  if (!desc || !cleanAmount || cleanAmount <= 0 || !date || !type || !cat) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const updated = { desc: String(desc).trim(), amount: cleanAmount, date: String(date), type: String(type), cat: String(cat) };
  const upd = await updateTransactionForUser(req.user.id, id, updated);
  if (!upd) return res.status(404).json({ message: "Transaction not found" });
  res.json({ transaction: upd });
});

app.delete("/api/transactions/:id", auth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ message: "Invalid id" });
  }

  const ok = await deleteTransactionForUser(req.user.id, id);
  if (!ok) return res.status(404).json({ message: "Transaction not found" });
  res.json({ ok: true });
});

const isMainModule = process.argv[1] && path.resolve(process.argv[1]) === __filename;

if (isMainModule) {
  app.listen(PORT, () => {
    console.log(`Aurum backend running on http://localhost:${PORT}`);
  });
}

export default app;
