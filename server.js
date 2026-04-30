import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { readFileSync, existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

let db;
const mem = {};
const memDb = {
  async get(k) { return mem[k]; },
  async set(k, v) { mem[k] = v; },
  async list(prefix = "") { return Object.keys(mem).filter(k => k.startsWith(prefix)); },
  async delete(k) { delete mem[k]; },
};
try {
  const { default: Database } = await import("@replit/database");
  const replDb = new Database();
  // Probe the DB with a benign call — fails locally outside Replit
  await replDb.list("");
  db = replDb;
  console.log("✅ Replit Database connected");
} catch (e) {
  db = memDb;
  console.log(`ℹ️  Replit DB unavailable (${e.message || e}); using in-memory store`);
}

// Seed starting bid into Replit DB if not already present
async function seedStartingBid() {
  const seedKey = "draft-2026-04-30T00-00-00-000Z";
  const seedFile = path.join(__dirname, "data", "custody-dad-proposal-starting-idea-2026-04-30.json");
  if (!existsSync(seedFile)) return;
  try {
    const existing = await db.get(seedKey);
    if (existing) return;
    const payload = JSON.parse(readFileSync(seedFile, "utf-8"));
    await db.set(seedKey, payload);
    console.log("✅ Seeded starting bid:", payload.name);
  } catch (e) {
    console.log("ℹ️  Could not seed starting bid:", e.message);
  }
}
seedStartingBid();

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

const PREFIX = "draft-";

app.get("/api/drafts", async (req, res) => {
  try {
    const keys = await db.list(PREFIX);
    const drafts = await Promise.all(keys.map(async k => {
      const v = await db.get(k);
      return { key: k, name: v?.name, savedAt: v?.savedAt };
    }));
    drafts.sort((a, b) => (b.savedAt || "").localeCompare(a.savedAt || ""));
    res.json(drafts);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/drafts/:key", async (req, res) => {
  try {
    const v = await db.get(req.params.key);
    if (!v) return res.status(404).json({ error: "not found" });
    res.json({ key: req.params.key, payload: v });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/drafts", async (req, res) => {
  try {
    const { name, payload } = req.body || {};
    if (!name || !payload) return res.status(400).json({ error: "name and payload required" });
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const key = PREFIX + ts;
    await db.set(key, payload);
    res.json({ key, name, savedAt: payload.savedAt || new Date().toISOString() });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete("/api/drafts/:key", async (req, res) => {
  try { await db.delete(req.params.key); res.json({ ok: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Custody calendar running on port ${port}`);
});
