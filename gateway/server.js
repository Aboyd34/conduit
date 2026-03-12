import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import Database from "better-sqlite3";

const app = express();
const PORT = 4000;
const db = new Database(":memory:");

db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    sender TEXT,
    content TEXT,
    signature TEXT,
    timestamp INTEGER,
    topic TEXT DEFAULT 'public'
  );
  CREATE TABLE IF NOT EXISTS peers (
    pubkey TEXT PRIMARY KEY,
    status TEXT,
    last_seen INTEGER
  );
`);

app.use(helmet());
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json({ limit: "50kb" }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

app.get("/api/feed", (req, res) => {
  const posts = db.prepare("SELECT * FROM posts ORDER BY timestamp DESC LIMIT 100").all();
  res.json(posts);
});

app.post("/api/posts", (req, res) => {
  const { id, content, signature, sender, timestamp, topic } = req.body;
  if (!id || !content || !signature || !sender)
    return res.status(400).json({ error: "Missing required fields" });
  try {
    db.prepare(`INSERT OR IGNORE INTO posts (id, sender, content, signature, timestamp, topic) VALUES (?, ?, ?, ?, ?, ?)`)
      .run(id, sender, content, signature, timestamp || Date.now(), topic || "public");
    res.status(201).json({ status: "ok" });
  } catch (e) {
    res.status(409).json({ error: "Duplicate post" });
  }
});

app.get("/api/peers", (req, res) => {
  res.json(db.prepare("SELECT * FROM peers ORDER BY last_seen DESC").all());
});

app.post("/api/peers", (req, res) => {
  const { pubkey, status } = req.body;
  if (!pubkey) return res.status(400).json({ error: "pubkey required" });
  db.prepare(`INSERT OR REPLACE INTO peers (pubkey, status, last_seen) VALUES (?, ?, ?)`)
    .run(pubkey, status || "online", Date.now());
  res.status(201).json({ status: "ok" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

setInterval(() => {
  const cutoff = Date.now() - 60 * 60 * 1000;
  db.prepare("DELETE FROM peers WHERE last_seen < ?").run(cutoff);
}, 30 * 60 * 1000);

app.listen(PORT, () => console.log(`Conduit Gateway running on http://localhost:${PORT}`));
