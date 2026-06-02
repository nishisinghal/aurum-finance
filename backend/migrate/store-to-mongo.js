import mongoose from "mongoose";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORE_PATH = path.join(__dirname, "..", "data", "store.json");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("Please set MONGODB_URI environment variable before running this migration.");
  process.exit(1);
}

async function readStore() {
  const raw = await fs.readFile(STORE_PATH, "utf-8");
  return JSON.parse(raw);
}

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const store = await readStore();
  if (!Array.isArray(store.users)) {
    console.error("No users array in store.json");
    process.exit(1);
  }

  // Upsert users
  for (const u of store.users) {
    const data = { id: u.id, name: u.name, email: u.email, password: u.password, role: u.role };
    await User.updateOne({ email: u.email }, { $set: data }, { upsert: true });
  }

  // Insert transactions
  if (store.transactions && typeof store.transactions === "object") {
    for (const [userId, txs] of Object.entries(store.transactions)) {
      if (!Array.isArray(txs)) continue;
      for (const t of txs) {
        const exists = await Transaction.findOne({ id: t.id, userId: Number(userId) }).lean();
        if (!exists) {
          await Transaction.create({ id: t.id, userId: Number(userId), desc: t.desc, amount: t.amount, date: t.date, type: t.type, cat: t.cat });
        }
      }
    }
  }

  console.log("Migration complete.");
  await mongoose.disconnect();
}

main().catch((err) => { console.error(err); process.exit(1); });
