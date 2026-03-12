import express, { Request, Response, NextFunction } from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import winston from "winston";
import Joi from "joi";
import crypto from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

const db = new Database(":memory:");

db.exec(`
  CREATE TABLE IF NOT EXISTS storage (
    key TEXT PRIMARY KEY,
    value TEXT
  );
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    topic TEXT,
    sender_pubkey TEXT,
    payload TEXT,
    signature TEXT,
    timestamp INTEGER
  );
  CREATE TABLE IF NOT EXISTS peers (
    pubkey TEXT PRIMARY KEY,
    last_seen INTEGER,
    status TEXT,
    connection_type TEXT,
    metadata TEXT
  );
  CREATE TABLE IF NOT EXISTS communities (
    id TEXT PRIMARY KEY,
    name TEXT,
    description TEXT,
    owner_pubkey TEXT,
    created_at INTEGER
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(helmet());
  app.use(cors({ origin: process.env.APP_URL || true, credentials: true }));
  app.use(express.json({ limit: "50kb" }));

  const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
  app.use("/api/", apiLimiter);

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", uptime: process.uptime(), timestamp: Date.now() });
  });

  app.get("/api/relay/feed", (req, res) => {
    const rows = db.prepare("SELECT * FROM messages ORDER BY timestamp DESC LIMIT 200").all() as any[];
    res.json(rows.map(r => ({ id: r.id, topic: r.topic, sender: r.sender_pubkey, content: r.payload, signature: r.signature, timestamp: r.timestamp })));
  });

  app.post("/api/relay/broadcast", (req, res) => {
    const { id, topic, sender, content, signature, timestamp } = req.body;
    if (!id || !content || !signature || !sender) return res.status(400).json({ error: "Missing fields" });
    try {
      db.prepare(`INSERT INTO messages (id, topic, sender_pubkey, payload, signature, timestamp) VALUES (?, ?, ?, ?, ?, ?)`)
        .run(id, topic || "public", sender, content, signature, timestamp || Date.now());
      res.status(201).json({ status: "ok" });
    } catch { res.status(409).json({ error: "Duplicate" }); }
  });

  app.get("/api/peers", (req, res) => {
    const rows = db.prepare("SELECT * FROM peers ORDER BY last_seen DESC").all() as any[];
    res.json(rows.map(r => ({ pubkey: r.pubkey, lastSeen: r.last_seen, status: r.status || "offline" })));
  });

  app.post("/api/peers", (req, res) => {
    const { pubkey, status } = req.body;
    if (!pubkey) return res.status(400).json({ error: "pubkey required" });
    db.prepare(`INSERT OR REPLACE INTO peers (pubkey, last_seen, status, connection_type, metadata) VALUES (?, ?, ?, ?, ?)`)
      .run(pubkey, Date.now(), status || "online", "relay", "{}");
    res.status(201).json({ status: "ok" });
  });

  app.get("/api/communities", (req, res) => {
    res.json(db.prepare("SELECT * FROM communities").all());
  });

  app.post("/api/communities", (req, res) => {
    const { id, name, description, owner_pubkey } = req.body;
    if (!id || !name || !owner_pubkey) return res.status(400).json({ error: "Missing fields" });
    db.prepare(`INSERT OR REPLACE INTO communities (id, name, description, owner_pubkey, created_at) VALUES (?, ?, ?, ?, ?)`)
      .run(id, name, description || "", owner_pubkey, Date.now());
    res.status(201).json({ status: "ok" });
  });

  setInterval(() => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    db.prepare("DELETE FROM peers WHERE last_seen < ?").run(cutoff);
    db.prepare("DELETE FROM messages WHERE timestamp < ?").run(cutoff);
  }, 60 * 60 * 1000);

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error("Unhandled error", { error: err.message });
    res.status(500).json({ error: "Internal server error" });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => res.sendFile(path.join(__dirname, "dist", "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => logger.info(`Conduit Node running on http://localhost:${PORT}`));
}

startServer();
