'use strict';
const express = require('express');
const { createServer: createHttpServer } = require('http');
const { WebSocketServer, WebSocket } = require('ws');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const { webcrypto } = require('crypto');

const DB_PATH = process.env.NODE_ENV === 'production'
  ? path.join(__dirname, 'conduit.db') : ':memory:';

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
    id TEXT PRIMARY KEY, post_id TEXT NOT NULL,
    sender_pubkey TEXT, content TEXT NOT NULL, timestamp INTEGER NOT NULL,
    FOREIGN KEY (post_id) REFERENCES messages(id)
  );
  CREATE TABLE IF NOT EXISTS signals (
    post_id TEXT NOT NULL, sender_pubkey TEXT NOT NULL, timestamp INTEGER NOT NULL,
    PRIMARY KEY (post_id, sender_pubkey)
  );
  CREATE TABLE IF NOT EXISTS amplifies (
    post_id TEXT NOT NULL, sender_pubkey TEXT NOT NULL, timestamp INTEGER NOT NULL,
    PRIMARY KEY (post_id, sender_pubkey)
  );

  CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    owner_pubkey TEXT NOT NULL,
    is_private INTEGER DEFAULT 0,
    is_gated INTEGER DEFAULT 0,
    aeth_required INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS room_members (
    room_id TEXT NOT NULL,
    pubkey TEXT NOT NULL,
    joined_at INTEGER NOT NULL,
    role TEXT DEFAULT 'member',
    PRIMARY KEY (room_id, pubkey)
  );
  CREATE TABLE IF NOT EXISTS room_messages (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL,
    sender_pubkey TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    FOREIGN KEY (room_id) REFERENCES rooms(id)
  );
  CREATE TABLE IF NOT EXISTS direct_messages (
    id TEXT PRIMARY KEY,
    sender_pubkey TEXT NOT NULL,
    recipient_pubkey TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    read INTEGER DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS profiles (
    pubkey TEXT PRIMARY KEY,
    display_name TEXT,
    bio TEXT,
    avatar TEXT,
    aeth_balance INTEGER DEFAULT 0,
    pioneer INTEGER DEFAULT 0,
    joined_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    recipient_pubkey TEXT NOT NULL,
    type TEXT NOT NULL,
    data TEXT NOT NULL,
    read INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS aeth_ledger (
    id TEXT PRIMARY KEY,
    pubkey TEXT NOT NULL,
    amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    timestamp INTEGER NOT NULL
  );
`);
db.pragma('journal_mode = WAL');

const AGE_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const PIONEER_CUTOFF = new Date('2026-06-01').getTime();

function verifyAgeToken(raw) {
  try {
    const token = JSON.parse(raw);
    if (!token.verified || !token.timestamp || !token.salt || !token.sig)
      return { valid: false, reason: 'malformed_token' };
    const age = Date.now() - token.timestamp;
    if (age > AGE_TOKEN_TTL_MS) return { valid: false, reason: 'token_expired' };
    if (age < 0) return { valid: false, reason: 'token_future' };
    const expected = crypto.createHash('sha256')
      .update(`conduit:age_verified:${token.timestamp}:${token.salt}`)
      .digest('hex');
    if (expected !== token.sig) return { valid: false, reason: 'invalid_sig' };
    return { valid: true, reason: 'ok' };
  } catch { return { valid: false, reason: 'parse_error' }; }
}

function requireAgeVerified(req, res, next) {
  const raw = req.headers['x-age-token'];
  if (!raw) return res.status(401).json({ error: 'age_verification_required' });
  const result = verifyAgeToken(raw);
  if (!result.valid) return res.status(403).json({ error: 'age_verification_failed', reason: result.reason });
  next();
}

async function verifyPostSignature(content, signatureB64, signingPublicKeyJwk) {
  try {
    const subtle = webcrypto.subtle;
    const jwk = JSON.parse(signingPublicKeyJwk);
    const pubKey = await subtle.importKey('jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
    const encoded = new TextEncoder().encode(content);
    const signature = Uint8Array.from(atob(signatureB64), c => c.charCodeAt(0));
    return await subtle.verify({ name: 'ECDSA', hash: { name: 'SHA-256' } }, pubKey, signature, encoded);
  } catch { return false; }
}

// AETH scoring engine
function awardAETH(pubkey, amount, reason) {
  const profile = db.prepare('SELECT aeth_balance, pioneer FROM profiles WHERE pubkey = ?').get(pubkey);
  if (!profile) return;
  const multiplier = profile.pioneer ? 2 : 1;
  const final = amount * multiplier;
  const cap = 50000;
  const current = profile.aeth_balance || 0;
  const awarded = Math.min(final, cap - current);
  if (awarded <= 0) return;
  db.prepare('UPDATE profiles SET aeth_balance = aeth_balance + ? WHERE pubkey = ?').run(awarded, pubkey);
  db.prepare('INSERT INTO aeth_ledger (id, pubkey, amount, reason, timestamp) VALUES (?, ?, ?, ?, ?)')
    .run(crypto.randomUUID(), pubkey, awarded, reason, Date.now());
}

function createNotification(recipient_pubkey, type, data) {
  db.prepare('INSERT INTO notifications (id, recipient_pubkey, type, data, read, created_at) VALUES (?, ?, ?, ?, 0, ?)')
    .run(crypto.randomUUID(), recipient_pubkey, type, JSON.stringify(data), Date.now());
  broadcastTo(recipient_pubkey, { type: 'notification', notification: { type, data } });
}

const clients = new Set();
const clientMap = new Map(); // pubkey -> ws

function broadcast(payload) {
  const msg = JSON.stringify(payload);
  for (const c of clients) if (c.readyState === WebSocket.OPEN) c.send(msg);
}

function broadcastTo(pubkey, payload) {
  const ws = clientMap.get(pubkey);
  if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(payload));
}

function broadcastToRoom(roomId, payload) {
  const members = db.prepare('SELECT pubkey FROM room_members WHERE room_id = ?').all(roomId);
  const msg = JSON.stringify(payload);
  for (const m of members) {
    const ws = clientMap.get(m.pubkey);
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(msg);
  }
}

async function startServer() {
  const app = express();
  const httpServer = createHttpServer(app);
  const PORT = Number(process.env.PORT) || 10000;
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws, req) => {
    clients.add(ws);
    const pubkey = new URL(req.url, 'http://localhost').searchParams.get('pubkey');
    if (pubkey) clientMap.set(pubkey, ws);

    const recent = db.prepare('SELECT * FROM messages ORDER BY timestamp DESC LIMIT 50').all();
    ws.send(JSON.stringify({
      type: 'init',
      posts: recent.map(r => ({
        id: r.id, topic: r.topic, sender: r.sender_pubkey,
        content: r.payload, signature: r.signature, timestamp: r.timestamp,
        replies: [], signals: 0, amplifies: 0
      }))
    }));
    ws.on('close', () => {
      clients.delete(ws);
      if (pubkey) clientMap.delete(pubkey);
    });
  });

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({
    origin: [
      process.env.ALLOWED_ORIGIN || '*',
      'https://conduit-blush.vercel.app',
      'https://cantc-ulive.live',
      'http://localhost:5173'
    ],
    credentials: true
  }));
  app.use(express.json({ limit: '50kb' }));
  app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

  app.get('/health', (req, res) => res.send('OK'));
  app.get('/api/health', (req, res) => res.json({
    status: 'ok', uptime: process.uptime(),
    timestamp: Date.now(), ws_clients: clients.size
  }));

  // ── FEED ──────────────────────────────────────────────
  app.get('/api/relay/feed', requireAgeVerified, (req, res) => {
    const rows = db.prepare('SELECT * FROM messages ORDER BY timestamp DESC LIMIT 200').all();
    res.json(rows.map(r => ({
      id: r.id, topic: r.topic, sender: r.sender_pubkey,
      content: r.payload, signature: r.signature, timestamp: r.timestamp
    })));
  });

  app.post('/api/relay/broadcast', requireAgeVerified, async (req, res) => {
    const { id, topic, sender, content, signature, timestamp } = req.body;
    if (!id || !content || !signature || !sender)
      return res.status(400).json({ error: 'Missing fields' });
    const sigValid = await verifyPostSignature(content, signature, sender);
    if (!sigValid) return res.status(403).json({ error: 'invalid_post_signature' });
    try {
      db.prepare('INSERT INTO messages (id, topic, sender_pubkey, payload, signature, timestamp) VALUES (?, ?, ?, ?, ?, ?)')
        .run(id, topic || 'public', sender, content, signature, timestamp || Date.now());
      awardAETH(sender, 50, 'post_published');
      const post = { id, topic: topic || 'public', sender, content, signature, timestamp: timestamp || Date.now(), replies: [], signals: 0, amplifies: 0 };
      broadcast({ type: 'new_post', post });
      res.status(201).json({ status: 'ok' });
    } catch { res.status(409).json({ error: 'Duplicate' }); }
  });

  app.post('/api/relay/:postId/reply', requireAgeVerified, (req, res) => {
    const { postId } = req.params;
    const { content, sender } = req.body;
    if (!content || !sender) return res.status(400).json({ error: 'Missing fields' });
    const post = db.prepare('SELECT id, sender_pubkey FROM messages WHERE id = ?').get(postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const id = crypto.randomUUID();
    const ts = Date.now();
    db.prepare('INSERT INTO replies (id, post_id, sender_pubkey, content, timestamp) VALUES (?, ?, ?, ?, ?)')
      .run(id, postId, sender, content, ts);
    awardAETH(post.sender_pubkey, 10, 'reply_received');
    createNotification(post.sender_pubkey, 'reply', { postId, sender, preview: content.slice(0, 80) });
    const reply = { id, postId, sender, content, timestamp: ts };
    broadcast({ type: 'new_reply', postId, reply });
    res.status(201).json(reply);
  });

  app.get('/api/relay/:postId/replies', requireAgeVerified, (req, res) => {
    const rows = db.prepare('SELECT * FROM replies WHERE post_id = ? ORDER BY timestamp ASC').all(req.params.postId);
    res.json(rows.map(r => ({ id: r.id, postId: r.post_id, sender: r.sender_pubkey, content: r.content, timestamp: r.timestamp })));
  });

  app.post('/api/relay/:postId/signal', requireAgeVerified, (req, res) => {
    const { postId } = req.params;
    const { sender } = req.body;
    if (!sender) return res.status(400).json({ error: 'Missing sender' });
    try {
      db.prepare('INSERT INTO signals (post_id, sender_pubkey, timestamp) VALUES (?, ?, ?)').run(postId, sender, Date.now());
      const post = db.prepare('SELECT sender_pubkey FROM messages WHERE id = ?').get(postId);
      if (post) {
        awardAETH(post.sender_pubkey, 20, 'signal_received');
        createNotification(post.sender_pubkey, 'signal', { postId, sender });
      }
      const count = db.prepare('SELECT COUNT(*) as cnt FROM signals WHERE post_id = ?').get(postId).cnt;
      broadcast({ type: 'signal_update', postId, count });
      res.status(201).json({ status: 'ok', count });
    } catch { res.status(409).json({ error: 'Already signaled' }); }
  });

  app.post('/api/relay/:postId/amplify', requireAgeVerified, (req, res) => {
    const { postId } = req.params;
    const { sender } = req.body;
    if (!sender) return res.status(400).json({ error: 'Missing sender' });
    try {
      db.prepare('INSERT INTO amplifies (post_id, sender_pubkey, timestamp) VALUES (?, ?, ?)').run(postId, sender, Date.now());
      const count = db.prepare('SELECT COUNT(*) as cnt FROM amplifies WHERE post_id = ?').get(postId).cnt;
      broadcast({ type: 'amplify_update', postId, count });
      res.status(201).json({ status: 'ok', count });
    } catch { res.status(409).json({ error: 'Already amplified' }); }
  });

  // ── ROOMS ─────────────────────────────────────────────
  app.get('/api/rooms', requireAgeVerified, (req, res) => {
    const rooms = db.prepare('SELECT * FROM rooms WHERE is_private = 0 ORDER BY created_at DESC').all();
    res.json(rooms);
  });

  app.post('/api/rooms', requireAgeVerified, (req, res) => {
    const { name, description, owner_pubkey, is_private, is_gated, aeth_required } = req.body;
    if (!name || !owner_pubkey) return res.status(400).json({ error: 'Missing fields' });
    const id = crypto.randomUUID();
    const ts = Date.now();
    db.prepare('INSERT INTO rooms (id, name, description, owner_pubkey, is_private, is_gated, aeth_required, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(id, name, description || '', owner_pubkey, is_private ? 1 : 0, is_gated ? 1 : 0, aeth_required || 0, ts);
    db.prepare('INSERT INTO room_members (room_id, pubkey, joined_at, role) VALUES (?, ?, ?, ?)').run(id, owner_pubkey, ts, 'owner');
    res.status(201).json({ id, name, description, owner_pubkey, is_private, is_gated, aeth_required, created_at: ts });
  });

  app.post('/api/rooms/:roomId/join', requireAgeVerified, (req, res) => {
    const { roomId } = req.params;
    const { pubkey } = req.body;
    if (!pubkey) return res.status(400).json({ error: 'Missing pubkey' });
    const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    if (room.is_gated) {
      const profile = db.prepare('SELECT aeth_balance FROM profiles WHERE pubkey = ?').get(pubkey);
      if (!profile || profile.aeth_balance < room.aeth_required)
        return res.status(403).json({ error: 'insufficient_aeth', required: room.aeth_required, balance: profile?.aeth_balance || 0 });
    }
    try {
      db.prepare('INSERT INTO room_members (room_id, pubkey, joined_at, role) VALUES (?, ?, ?, ?)').run(roomId, pubkey, Date.now(), 'member');
      broadcastToRoom(roomId, { type: 'room_join', roomId, pubkey });
      res.status(201).json({ status: 'ok' });
    } catch { res.status(409).json({ error: 'Already a member' }); }
  });

  app.post('/api/rooms/:roomId/leave', requireAgeVerified, (req, res) => {
    const { roomId } = req.params;
    const { pubkey } = req.body;
    if (!pubkey) return res.status(400).json({ error: 'Missing pubkey' });
    db.prepare('DELETE FROM room_members WHERE room_id = ? AND pubkey = ?').run(roomId, pubkey);
    broadcastToRoom(roomId, { type: 'room_leave', roomId, pubkey });
    res.json({ status: 'ok' });
  });

  app.get('/api/rooms/:roomId/members', requireAgeVerified, (req, res) => {
    const members = db.prepare('SELECT pubkey, joined_at, role FROM room_members WHERE room_id = ? ORDER BY joined_at ASC').all(req.params.roomId);
    res.json(members);
  });

  app.get('/api/rooms/:roomId/messages', requireAgeVerified, (req, res) => {
    const { roomId } = req.params;
    const { pubkey } = req.query;
    const member = db.prepare('SELECT pubkey FROM room_members WHERE room_id = ? AND pubkey = ?').get(roomId, pubkey);
    if (!member) return res.status(403).json({ error: 'not_a_member' });
    const msgs = db.prepare('SELECT * FROM room_messages WHERE room_id = ? ORDER BY timestamp DESC LIMIT 100').all(roomId);
    res.json(msgs);
  });

  app.post('/api/rooms/:roomId/messages', requireAgeVerified, (req, res) => {
    const { roomId } = req.params;
    const { sender_pubkey, content } = req.body;
    if (!sender_pubkey || !content) return res.status(400).json({ error: 'Missing fields' });
    const member = db.prepare('SELECT pubkey FROM room_members WHERE room_id = ? AND pubkey = ?').get(roomId, sender_pubkey);
    if (!member) return res.status(403).json({ error: 'not_a_member' });
    const id = crypto.randomUUID();
    const ts = Date.now();
    db.prepare('INSERT INTO room_messages (id, room_id, sender_pubkey, content, timestamp) VALUES (?, ?, ?, ?, ?)')
      .run(id, roomId, sender_pubkey, content, ts);
    const msg = { id, roomId, sender_pubkey, content, timestamp: ts };
    broadcastToRoom(roomId, { type: 'room_message', msg });
    res.status(201).json(msg);
  });

  // ── DIRECT MESSAGES ───────────────────────────────────
  app.get('/api/dm/:pubkey', requireAgeVerified, (req, res) => {
    const { pubkey } = req.params;
    const { with: withPubkey } = req.query;
    if (!withPubkey) return res.status(400).json({ error: 'Missing with param' });
    const msgs = db.prepare(`
      SELECT * FROM direct_messages
      WHERE (sender_pubkey = ? AND recipient_pubkey = ?)
         OR (sender_pubkey = ? AND recipient_pubkey = ?)
      ORDER BY timestamp ASC LIMIT 200
    `).all(pubkey, withPubkey, withPubkey, pubkey);
    res.json(msgs);
  });

  app.post('/api/dm', requireAgeVerified, (req, res) => {
    const { sender_pubkey, recipient_pubkey, content } = req.body;
    if (!sender_pubkey || !recipient_pubkey || !content)
      return res.status(400).json({ error: 'Missing fields' });
    const id = crypto.randomUUID();
    const ts = Date.now();
    db.prepare('INSERT INTO direct_messages (id, sender_pubkey, recipient_pubkey, content, timestamp, read) VALUES (?, ?, ?, ?, ?, 0)')
      .run(id, sender_pubkey, recipient_pubkey, content, ts);
    const msg = { id, sender_pubkey, recipient_pubkey, content, timestamp: ts };
    broadcastTo(recipient_pubkey, { type: 'dm', msg });
    createNotification(recipient_pubkey, 'dm', { sender: sender_pubkey, preview: content.slice(0, 80) });
    res.status(201).json(msg);
  });

  app.post('/api/dm/:msgId/read', requireAgeVerified, (req, res) => {
    db.prepare('UPDATE direct_messages SET read = 1 WHERE id = ?').run(req.params.msgId);
    res.json({ status: 'ok' });
  });

  // ── PROFILES ──────────────────────────────────────────
  app.get('/api/profile/:pubkey', requireAgeVerified, (req, res) => {
    const profile = db.prepare('SELECT * FROM profiles WHERE pubkey = ?').get(req.params.pubkey);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  });

  app.post('/api/profile', requireAgeVerified, (req, res) => {
    const { pubkey, display_name, bio, avatar } = req.body;
    if (!pubkey) return res.status(400).json({ error: 'Missing pubkey' });
    const ts = Date.now();
    const existing = db.prepare('SELECT pubkey FROM profiles WHERE pubkey = ?').get(pubkey);
    if (existing) {
      db.prepare('UPDATE profiles SET display_name = ?, bio = ?, avatar = ?, updated_at = ? WHERE pubkey = ?')
        .run(display_name || '', bio || '', avatar || '', ts, pubkey);
    } else {
      const pioneer = ts < PIONEER_CUTOFF ? 1 : 0;
      db.prepare('INSERT INTO profiles (pubkey, display_name, bio, avatar, aeth_balance, pioneer, joined_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .run(pubkey, display_name || '', bio || '', avatar || '', pioneer ? 1000 : 0, pioneer, ts, ts);
    }
    res.status(201).json({ status: 'ok', pioneer: ts < PIONEER_CUTOFF });
  });

  app.get('/api/profile/:pubkey/aeth', requireAgeVerified, (req, res) => {
    const profile = db.prepare('SELECT aeth_balance, pioneer FROM profiles WHERE pubkey = ?').get(req.params.pubkey);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    const ledger = db.prepare('SELECT * FROM aeth_ledger WHERE pubkey = ? ORDER BY timestamp DESC LIMIT 50').all(req.params.pubkey);
    res.json({ balance: profile.aeth_balance, pioneer: !!profile.pioneer, ledger });
  });

  // ── NOTIFICATIONS ─────────────────────────────────────
  app.get('/api/notifications/:pubkey', requireAgeVerified, (req, res) => {
    const rows = db.prepare('SELECT * FROM notifications WHERE recipient_pubkey = ? ORDER BY created_at DESC LIMIT 50').all(req.params.pubkey);
    res.json(rows);
  });

  app.post('/api/notifications/:id/read', requireAgeVerified, (req, res) => {
    db.prepare('UPDATE notifications SET read = 1 WHERE id = ?').run(req.params.id);
    res.json({ status: 'ok' });
  });

  app.post('/api/notifications/read-all', requireAgeVerified, (req, res) => {
    const { pubkey } = req.body;
    if (!pubkey) return res.status(400).json({ error: 'Missing pubkey' });
    db.prepare('UPDATE notifications SET read = 1 WHERE recipient_pubkey = ?').run(pubkey);
    res.json({ status: 'ok' });
  });

  // ── PEERS & COMMUNITIES (existing) ────────────────────
  app.get('/api/peers', requireAgeVerified, (req, res) => {
    const rows = db.prepare('SELECT * FROM peers ORDER BY last_seen DESC').all();
    res.json(rows.map(r => ({ pubkey: r.pubkey, lastSeen: r.last_seen, status: r.status || 'offline' })));
  });

  app.post('/api/peers', requireAgeVerified, (req, res) => {
    const { pubkey, status } = req.body;
    if (!pubkey) return res.status(400).json({ error: 'pubkey required' });
    db.prepare('INSERT OR REPLACE INTO peers (pubkey, last_seen, status, connection_type, metadata) VALUES (?, ?, ?, ?, ?)')
      .run(pubkey, Date.now(), status || 'online', 'relay', '{}');
    res.status(201).json({ status: 'ok' });
  });

  app.get('/api/communities', requireAgeVerified, (req, res) => {
    res.json(db.prepare('SELECT * FROM communities').all());
  });

  app.post('/api/communities', requireAgeVerified, (req, res) => {
    const { id, name, description, owner_pubkey } = req.body;
    if (!id || !name || !owner_pubkey) return res.status(400).json({ error: 'Missing fields' });
    db.prepare('INSERT OR REPLACE INTO communities (id, name, description, owner_pubkey, created_at) VALUES (?, ?, ?, ?, ?)')
      .run(id, name, description || '', owner_pubkey, Date.now());
    res.status(201).json({ status: 'ok' });
  });

  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    const f = path.join(__dirname, 'dist', 'index.html');
    if (fs.existsSync(f)) res.sendFile(f);
    else res.json({ status: 'ok', message: 'Conduit API running' });
  });

  setInterval(() => {
    db.prepare('DELETE FROM peers WHERE last_seen < ?').run(Date.now() - 7 * 24 * 60 * 60 * 1000);
  }, 60 * 60 * 1000);

  httpServer.listen(PORT, '0.0.0.0', () =>
    console.log(`🚀 Conduit Node live on http://localhost:${PORT}`)
  );
}

startServer();
