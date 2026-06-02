import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORE_PATH = path.join(__dirname, "..", "data", "store.json");

async function readStore() {
  const raw = await fs.readFile(STORE_PATH, "utf-8");
  return JSON.parse(raw);
}

async function writeStore(store) {
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

function looksHashed(pw) {
  if (!pw || typeof pw !== "string") return false;
  return pw.startsWith("$2a$") || pw.startsWith("$2b$") || pw.startsWith("$2y$");
}

async function migrate() {
  const store = await readStore();
  if (!Array.isArray(store.users)) {
    console.error("store.json does not contain a users array");
    process.exit(1);
  }

  let changed = 0;

  for (let u of store.users) {
    if (!u.password) continue;
    if (looksHashed(u.password)) continue;
    const hashed = await bcrypt.hash(String(u.password), 10);
    u.password = hashed;
    changed++;
  }

  if (changed > 0) {
    await writeStore(store);
    console.log(`Hashed ${changed} user password(s) and updated store.json`);
  } else {
    console.log("No plaintext passwords found. Nothing to do.");
  }
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
