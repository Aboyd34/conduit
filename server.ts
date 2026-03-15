import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import { createServer as createHttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import winston from 'winston';
import crypto from 'crypto';
import { webcrypto } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  ],
});

const DB_PATH = process.env.NODE_ENV === 'production'
  ? path.join(__dirname, 'conduit.db')
  : ':memory:';

if (process.env.NODE_ENV === 'production') {
  logger.info(`Database path: ${DB_PATH}`);
}

const db = new Database(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS storage (key TEXT PRIMARY KEY, value TEXT);
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY, topic TEXT, sender_pubkey TEXT,
    payload TEXT, signature TEXT, timestamp INTEGER
  );
  CREATE TABLE IF NOT EXISTS peers (
    pubkey TEXT PRIMARY KEY, last_seen INTEGER,
    status TEXT, connection_type TEXT, metadata TEXT
  );
  CREATE TABLE IF NOT EXISTS communities (
    id TEXT PRIMARY KEY, name TEXT, description TEXT,
    owner_pubkey TEXT, created_at INTEGER
  );
  CREATE TABLE IF NOT EXISTS replies (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL,
    sender_pubkey TEXT,
    content TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    FOREIGN KEY (post_id) REFERENCES messages(id)
  );
  CREATE TABLE IF NOT EXISTS signals (
    post_id TEXT NOT NULL,
    sender_pubkey TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    PRIMARY KEY (post_id, sender_pubkey)
  );
  CREATE TABLE IF NOT EXISTS amplifies (
    post_id TEXT NOT NULL,
    sender_pubkey TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    PRIMARY KEY (post_id, sender_pubkey)
  );
`);

db.pragma('journal_mode = WAL');

// ---------------------------------------------------------------------------
// Age Verification
// ---------------------------------------------------------------------------

const AGE_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function verifyAgeTokenServer(raw: string): { valid: boolean; reason: string } {
  try {
    const token = JSON.parse(raw);
    if (!token.verified || !token.timestamp || !token.salt || !token.sig)
      return { valid: false, reason: 'malformed_token' };
    const age = Date.now() - token.timestamp;
    if (age > AGE_TOKEN_TTL_MS) return { valid: false, reason: 'token_expired' };
    if (age < 0) return { valid: false, reason: 'token_future' };
    const expected = crypto
      .createHash('sha256')
      .update(`conduit:age_verified:${token.timestamp}:${token.salt}`)
      .digest('hex');
    if (expected !== token.sig) return { valid: false, reason: 'invalid_sig' };
    return { valid: true, reason: 'ok' };
  } catch {
    return { valid: false, reason: 'parse_error' };
  }
}

function requireAgeVerified(req: Request, res: Response, next: NextFunction) {
  const raw = req.headers['x-age-token'] as string | undefined;
  if (!raw) return res.status(401).json({ error: 'age_verification_required' });
  const result = verifyAgeTokenServer(raw);
  if (!result.valid) {
    logger.warn('Age token rejected', { reason: result.reason, ip: req.ip });
    return res.status(403).json({ error: 'age_verification_failed', reason: result.reason });
  }
  next();
}

// ---------------------------------------------------------------------------
// ECDSA Signature Verification
// ---------------------------------------------------------------------------

async function verifyPostSignature(content: string, signatureB64: string, signingPublicKeyJwk: string): Promise<boolean> {
  try {
    const subtle = webcrypto.subtle;
    const jwk = JSON.parse(signingPublicKeyJwk);
    const pubKey = await subtle.importKey('jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
    const encoded = new TextEncoder().encode(content);
    const signature = Uint8Array.from(atob(signatureB64), (c) => c.charCodeAt(0));
    return await subtle.verify({ name: 'ECDSA', hash: { name: 'SHA-256' } }, pubKey, signature, encoded);
  } catch (e) {
    logger.warn('Post signature verification error', { error: (e as Error).message });
    return false;
  }
}

// ---------------------------------------------------------------------------
// WebSocket Broadcast
// ---------------------------------------------------------------------------

const clients = new Set<WebSocket>();

function broadcastToClients(payload: object) {
  const msg = JSON.stringify(payload);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) client.send(msg);
  }
}

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------

async function startServer() {
  const app = express();
  const httpServer = createHttpServer(app);
  const PORT = Number(process.env.PORT) || 3000;

  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    clients.add(ws);
    logger.info('WS client connected', { total: clients.size });

    const recent = db.prepare('SELECT * FROM messages ORDER BY timestamp DESC LIMIT 50').all() as any[];
    const postIds = recent.map((r) => r.id);

    // Batch-load replies and signals for the initial posts
    const repliesMap: Record<string, any[]> = {};
    const signalsMap: Record<string, number> = {};
    const ampMap: Record<string, number> = {};

    for (const id of postIds) {
      repliesMap[id] = (db.prepare('SELECT * FROM replies WHERE post_id = ? ORDER BY timestamp ASC').all(id) as any[]).map((r) => ({
        id: r.id, postId: r.post_id, sender: r.sender_pubkey, content: r.content, timestamp: r.timestamp,
      }));
      signalsMap[id] = (db.prepare('SELECT COUNT(*) as cnt FROM signals WHERE post_id = ?').get(id) as any).cnt;
      ampMap[id] = (db.prepare('SELECT COUNT(*) as cnt FROM amplifies WHERE post_id = ?').get(id) as any).cnt;
    }

    ws.send(JSON.stringify({
      type: 'init',
      posts: recent.map((r) => ({
        id: r.id, topic: r.topic, sender: r.sender_pubkey,
        content: r.payload, signature: r.signature, timestamp: r.timestamp,
        replies: repliesMap[r.id] || [],
        signals: signalsMap[r.id] || 0,
        amplifies: ampMap[r.id] || 0,
      })),
    }));

    ws.on('close', () => {
      clients.delete(ws);
      logger.info('WS client disconnected', { total: clients.size });
    });
  });

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: process.env.APP_URL || true, credentials: true }));
  app.use(express.json({ limit: '50kb' }));

  const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
  app.use('/api/', apiLimiter);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime(), timestamp: Date.now(), ws_clients: clients.size, db: DB_PATH });
  });

  app.get('/api/relay/feed', requireAgeVerified, (req, res) => {
    const rows = db.prepare('SELECT * FROM messages ORDER BY timestamp DESC LIMIT 200').all() as any[];
    res.json(rows.map((r) => ({
      id: r.id, topic: r.topic, sender: r.sender_pubkey,
      content: r.payload, signature: r.signature, timestamp: r.timestamp,
    })));
  });

  app.post('/api/relay/broadcast', requireAgeVerified, async (req, res) => {
    const { id, topic, sender, content, signature, timestamp } = req.body;
    if (!id || !content || !signature || !sender)
      return res.status(400).json({ error: 'Missing fields' });

    const sigValid = await verifyPostSignature(content, signature, sender);
    if (!sigValid) {
      logger.warn('Broadcast rejected — invalid ECDSA signature', { sender: String(sender).slice(0, 32) });
      return res.status(403).json({ error: 'invalid_post_signature' });
    }

    try {
      db.prepare(`INSERT INTO messages (id, topic, sender_pubkey, payload, signature, timestamp) VALUES (?, ?, ?, ?, ?, ?)`)
        .run(id, topic || 'public', sender, content, signature, timestamp || Date.now());

      const post = { id, topic: topic || 'public', sender, content, signature, timestamp: timestamp || Date.now(), replies: [], signals: 0, amplifies: 0 };
      broadcastToClients({ type: 'new_post', post });
      res.status(201).json({ status: 'ok' });
    } catch {
      res.status(409).json({ error: 'Duplicate' });
    }
  });

  // ---------------------------------------------------------------------------
  // Replies
  // ---------------------------------------------------------------------------

  app.post('/api/relay/:postId/reply', requireAgeVerified, (req, res) => {
    const { postId } = req.params;
    const { content, sender } = req.body;
    if (!content || !sender) return res.status(400).json({ error: 'Missing fields' });

    const post = db.prepare('SELECT id FROM messages WHERE id = ?').get(postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const id = crypto.randomUUID();
    const timestamp = Date.now();
    db.prepare('INSERT INTO replies (id, post_id, sender_pubkey, content, timestamp) VALUES (?, ?, ?, ?, ?)')
      .run(id, postId, sender, content, timestamp);

    const reply = { id, postId, sender, content, timestamp };
    broadcastToClients({ type: 'new_reply', postId, reply });
    res.status(201).json(reply);
  });

  app.get('/api/relay/:postId/replies', requireAgeVerified, (req, res) => {
    const { postId } = req.params;
    const rows = db.prepare('SELECT * FROM replies WHERE post_id = ? ORDER BY timestamp ASC').all(postId) as any[];
    res.json(rows.map((r) => ({ id: r.id, postId: r.post_id, sender: r.sender_pubkey, content: r.content, timestamp: r.timestamp })));
  });

  // ---------------------------------------------------------------------------
  // Signals (likes)
  // ---------------------------------------------------------------------------

  app.post('/api/relay/:postId/signal', requireAgeVerified, (req, res) => {
    const { postId } = req.params;
    const { sender } = req.body;
    if (!sender) return res.status(400).json({ error: 'Missing sender' });

    try {
      db.prepare('INSERT INTO signals (post_id, sender_pubkey, timestamp) VALUES (?, ?, ?)')
        .run(postId, sender, Date.now());
      const count = (db.prepare('SELECT COUNT(*) as cnt FROM signals WHERE post_id = ?').get(postId) as any).cnt;
      broadcastToClients({ type: 'signal_update', postId, count });
      res.status(201).json({ status: 'ok', count });
    } catch {
      res.status(409).json({ error: 'Already signaled' });
    }
  });

  // ---------------------------------------------------------------------------
  // Amplifies (reposts)
  // ---------------------------------------------------------------------------

  app.post('/api/relay/:postId/amplify', requireAgeVerified, (req, res) => {
    const { postId } = req.params;
    const { sender } = req.body;
    if (!sender) return res.status(400).json({ error: 'Missing sender' });

    try {
      db.prepare('INSERT INTO amplifies (post_id, sender_pubkey, timestamp) VALUES (?, ?, ?)')
        .run(postId, sender, Date.now());
      const count = (db.prepare('SELECT COUNT(*) as cnt FROM amplifies WHERE post_id = ?').get(postId) as any).cnt;
      broadcastToClients({ type: 'amplify_update', postId, count });
      res.status(201).json({ status: 'ok', count });
    } catch {
      res.status(409).json({ error: 'Already amplified' });
    }
  });

  // ---------------------------------------------------------------------------
  // Peers & Communities
  // ---------------------------------------------------------------------------

  app.get('/api/peers', requireAgeVerified, (req, res) => {
    const rows = db.prepare('SELECT * FROM peers ORDER BY last_seen DESC').all() as any[];
    res.json(rows.map((r) => ({ pubkey: r.pubkey, lastSeen: r.last_seen, status: r.status || 'offline' })));
  });

  app.post('/api/peers', requireAgeVerified, (req, res) => {
    const { pubkey, status } = req.body;
    if (!pubkey) return res.status(400).json({ error: 'pubkey required' });
    db.prepare(`INSERT OR REPLACE INTO peers (pubkey, last_seen, status, connection_type, metadata) VALUES (?, ?, ?, ?, ?)`)
      .run(pubkey, Date.now(), status || 'online', 'relay', '{}');
    res.status(201).json({ status: 'ok' });
  });

  app.get('/api/communities', requireAgeVerified, (req, res) => {
    res.json(db.prepare('SELECT * FROM communities').all());
  });

  app.post('/api/communities', requireAgeVerified, (req, res) => {
    const { id, name, description, owner_pubkey } = req.body;
    if (!id || !name || !owner_pubkey) return res.status(400).json({ error: 'Missing fields' });
    db.prepare(`INSERT OR REPLACE INTO communities (id, name, description, owner_pubkey, created_at) VALUES (?, ?, ?, ?, ?)`)
      .run(id, name, description || '', owner_pubkey, Date.now());
    res.status(201).json({ status: 'ok' });
  });

  setInterval(() => {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    db.prepare('DELETE FROM peers WHERE last_seen < ?').run(cutoff);
  }, 60 * 60 * 1000);

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error('Unhandled error', { error: err.message });
    res.status(500).json({ error: 'Internal server error' });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));
  }

  httpServer.listen(PORT, '0.0.0.0', () =>
    logger.info(`Conduit Node running on http://localhost:${PORT}`)
  );
}

startServer();
