'use strict';
const express = require('express');
const { createServer: createHttpServer } = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const { initDb, dbAll } = require('./db');
const { registerClient, unregisterClient, getClientCount } = require('./ws');
const { startCleanupJobs } = require('./cleanup');

const feedRouter        = require('./routes/feed');
const roomsRouter       = require('./routes/rooms');
const dmRouter          = require('./routes/dm');
const profilesRouter    = require('./routes/profiles');
const notificationsRouter = require('./routes/notifications');
const peersRouter       = require('./routes/peers');
const communitiesRouter = require('./routes/communities');
const aiRouter          = require('./routes/ai');

const ALLOWED_ORIGINS = [
  'https://conduitprotect.info',
  'https://www.conduitprotect.info',
  'https://conduit-blush.vercel.app',
  'https://cantc-ulive.live',
  'http://localhost:5173',
  'http://localhost:3001'
];
if (process.env.ALLOWED_ORIGIN) ALLOWED_ORIGINS.push(process.env.ALLOWED_ORIGIN);

async function startServer() {
  await initDb();
  const app = express();
  const httpServer = createHttpServer(app);
  const PORT = Number(process.env.PORT) || 10000;
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  app.set('trust proxy', 1);
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({
    origin: (origin, cb) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) cb(null, true);
      else cb(new Error('Not allowed by CORS'));
    },
    credentials: true
  }));
  app.use(express.json({ limit: '50kb' }));
  app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false }));

  // ── WebSocket ─────────────────────────────────────────────────────────────
  wss.on('connection', async (ws, req) => {
    const pubkey = new URL(req.url, 'http://localhost').searchParams.get('pubkey');
    registerClient(ws, pubkey);
    try {
      const recent = await dbAll('SELECT * FROM messages ORDER BY timestamp DESC LIMIT 50');
      ws.send(JSON.stringify({
        type: 'init',
        posts: recent.map(r => ({
          id: r.id, topic: r.topic, sender: r.sender_pubkey,
          content: r.payload, signature: r.signature, timestamp: r.timestamp,
          replies: [], signals: 0, amplifies: 0
        }))
      }));
    } catch (e) { console.error('[WS] init error:', e.message); }
    ws.on('error', (e) => console.error('[WS] error:', e.message));
    ws.on('close', () => unregisterClient(ws, pubkey));
  });

  // ── Health ────────────────────────────────────────────────────────────────
  app.get('/health', (req, res) => res.json({ status: 'ok', uptime: Math.floor(process.uptime()) }));
  app.get('/api/health', (req, res) => res.json({
    status: 'ok', uptime: process.uptime(),
    timestamp: Date.now(), ws_clients: getClientCount()
  }));

  // ── Routes ────────────────────────────────────────────────────────────────
  app.use('/api/relay',         feedRouter);
  app.use('/api/rooms',         roomsRouter);
  app.use('/api/dm',            dmRouter);
  app.use('/api/profile',       profilesRouter);
  app.use('/api/notifications', notificationsRouter);
  app.use('/api/peers',         peersRouter);
  app.use('/api/communities',   communitiesRouter);
  app.use('/api/ai',            aiRouter);

  // ── Static (serve React build) ────────────────────────────────────────────
  app.use(express.static(path.join(__dirname, '..', 'dist')));
  app.get('*', (req, res) => {
    const f = path.join(__dirname, '..', 'dist', 'index.html');
    if (fs.existsSync(f)) res.sendFile(f);
    else res.json({ status: 'ok', message: 'Conduit API running — no frontend build found' });
  });

  startCleanupJobs();

  httpServer.listen(PORT, '0.0.0.0', () =>
    console.log(`🚀 Conduit Node live on http://localhost:${PORT}`)
  );
}

startServer().catch(err => {
  console.error('[FATAL] startServer crashed:', err);
  process.exit(1);
});
