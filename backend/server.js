import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "aurum_dev_secret_change_me";
const STORE_PATH = path.join(__dirname, "data", "store.json");

const app = express();
app.use(cors());
app.use(express.json());

async function readStore() {
  const raw = await fs.readFile(STORE_PATH, "utf-8");
  return JSON.parse(raw);
}

async function writeStore(store) {
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
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

  const store = await readStore();
  const user = store.users.find(
    (u) => u.email.toLowerCase() === String(email).toLowerCase() && u.password === password,
  );

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

  const store = await readStore();
  const exists = store.users.some((u) => u.email.toLowerCase() === cleanEmail);
  if (exists) {
    return res.status(409).json({ message: "Account already exists for this email" });
  }

  const nextId = store.users.length ? Math.max(...store.users.map((u) => u.id)) + 1 : 1;
  const nextUser = {
    id: nextId,
    name: cleanName,
    email: cleanEmail,
    password: cleanPassword,
    role: "admin",
  };

  store.users.push(nextUser);
  store.transactions[String(nextId)] = [];
  await writeStore(store);

  const payload = { id: nextUser.id, role: nextUser.role, email: nextUser.email, name: nextUser.name };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

  res.status(201).json({ token, user: sanitizeUser(nextUser) });
});

app.get("/api/auth/me", auth, async (req, res) => {
  const store = await readStore();
  const user = store.users.find((u) => u.id === req.user.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({ user: sanitizeUser(user) });
});

app.get("/api/transactions", auth, async (req, res) => {
  const store = await readStore();
  const key = String(req.user.id);
  const txs = store.transactions[key] || [];
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

  const store = await readStore();
  const key = String(req.user.id);
  const txs = store.transactions[key] || [];

  const nextId = txs.length ? Math.max(...txs.map((t) => t.id)) + 1 : 1;
  const nextTx = {
    id: nextId,
    desc: String(desc).trim(),
    amount: cleanAmount,
    date: String(date),
    type: String(type),
    cat: String(cat),
  };

  store.transactions[key] = [...txs, nextTx];
  await writeStore(store);

  res.status(201).json({ transaction: nextTx });
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

  const store = await readStore();
  const key = String(req.user.id);
  const txs = store.transactions[key] || [];
  const idx = txs.findIndex((t) => t.id === id);

  if (idx < 0) {
    return res.status(404).json({ message: "Transaction not found" });
  }

  const updated = {
    ...txs[idx],
    desc: String(desc).trim(),
    amount: cleanAmount,
    date: String(date),
    type: String(type),
    cat: String(cat),
  };

  txs[idx] = updated;
  store.transactions[key] = txs;
  await writeStore(store);

  res.json({ transaction: updated });
});

app.delete("/api/transactions/:id", auth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ message: "Invalid id" });
  }

  const store = await readStore();
  const key = String(req.user.id);
  const txs = store.transactions[key] || [];

  const exists = txs.some((t) => t.id === id);
  if (!exists) {
    return res.status(404).json({ message: "Transaction not found" });
  }

  store.transactions[key] = txs.filter((t) => t.id !== id);
  await writeStore(store);

  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Aurum backend running on http://localhost:${PORT}`);
});
