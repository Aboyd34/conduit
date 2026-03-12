import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import winston from 'winston';
import crypto from 'crypto';
import { webcrypto } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const logger = winston.createLogger({
  level: 'info',
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

const db = new Database(':memory:');

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

// ---------------------------------------------------------------------------
// Age Verification Middleware
// ---------------------------------------------------------------------------

const AGE_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function verifyAgeTokenServer(raw: string): { valid: boolean; reason: string } {
  try {
    const token = JSON.parse(raw);
    if (!token.verified || !token.timestamp || !token.salt || !token.sig) {
      return { valid: false, reason: 'malformed_token' };
    }
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
  if (!raw) {
    return res.status(401).json({ error: 'age_verification_required', message: 'X-Age-Token header missing' });
  }
  const result = verifyAgeTokenServer(raw);
  if (!result.valid) {
    logger.warn('Age token rejected', { reason: result.reason, ip: req.ip });
    return res.status(403).json({ error: 'age_verification_failed', reason: result.reason });
  }
  next();
}

// ---------------------------------------------------------------------------
// ECDSA P-256 Post Signature Verification (matches Web Crypto API client)
// ---------------------------------------------------------------------------

async function verifyPostSignature(
  content: string,
  signatureB64: string,
  signingPublicKeyJwk: string
): Promise<boolean> {
  try {
    const subtle = webcrypto.subtle;
    const jwk = JSON.parse(signingPublicKeyJwk);
    const pubKey = await subtle.importKey(
      'jwk',
      jwk,
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['verify']
    );
    const encoded = new TextEncoder().encode(content);
    const signature = Uint8Array.from(atob(signatureB64), (c) => c.charCodeAt(0));
    return await subtle.verify(
      { name: 'ECDSA', hash: { name: 'SHA-256' } },
      pubKey,
      signature,
      encoded
    );
  } catch (e) {
    logger.warn('Post signature verification error', { error: (e as Error).message });
    return false;
  }
}

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(helmet());
  app.use(cors({ origin: process.env.APP_URL || true, credentials: true }));
  app.use(express.json({ limit: '50kb' }));

  const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
  app.use('/api/', apiLimiter);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime(), timestamp: Date.now() });
  });

  app.get('/api/relay/feed', requireAgeVerified, (req, res) => {
    const rows = db.prepare('SELECT * FROM messages ORDER BY timestamp DESC LIMIT 200').all() as any[];
    res.json(rows.map((r) => ({
      id: r.id,
      topic: r.topic,
      sender: r.sender_pubkey,
      content: r.payload,
      signature: r.signature,
      timestamp: r.timestamp,
    })));
  });

  // broadcast: age verified + ECDSA signature verified
  app.post('/api/relay/broadcast', requireAgeVerified, async (req, res) => {
    const { id, topic, sender, content, signature, timestamp } = req.body;
    if (!id || !content || !signature || !sender) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const sigValid = await verifyPostSignature(content, signature, sender);
    if (!sigValid) {
      logger.warn('Broadcast rejected — invalid ECDSA signature', { sender: String(sender).slice(0, 32) });
      return res.status(403).json({ error: 'invalid_post_signature' });
    }

    try {
      db.prepare(`INSERT INTO messages (id, topic, sender_pubkey, payload, signature, timestamp) VALUES (?, ?, ?, ?, ?, ?)`)
        .run(id, topic || 'public', sender, content, signature, timestamp || Date.now());
      res.status(201).json({ status: 'ok' });
    } catch {
      res.status(409).json({ error: 'Duplicate' });
    }
  });

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
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    db.prepare('DELETE FROM peers WHERE last_seen < ?').run(cutoff);
    db.prepare('DELETE FROM messages WHERE timestamp < ?').run(cutoff);
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

  app.listen(PORT, '0.0.0.0', () => logger.info(`Conduit Node running on http://localhost:${PORT}`));
}

startServer();
