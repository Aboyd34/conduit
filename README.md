# ⚡ Conduit

> Encrypted, decentralized social network — real-time rooms, AI assistant, AETH token economy.

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite + React Router v6 |
| Backend | Node.js + Express + WebSocket (ws) |
| Database | SQLite (WAL mode) — persisted in `data/` on Render |
| AI | Groq API — llama-3.3-70b-versatile (free tier) |
| Auth | Browser-side cryptographic keypair (ECDSA P-256) |
| Token | AETH — earned by posting, replies, signals |

## Local Dev

```bash
cp .env.example .env          # add GROQ_API_KEY
npm install
npm run dev:all               # Vite :5173 + Node :3001 concurrently
```

## Production Deploy (Render)

1. Connect `Aboyd34/conduit` repo on [render.com](https://render.com)
2. Build command: `npm install && npm run build`
3. Start command: `node server.js`
4. Add env var: `GROQ_API_KEY=gsk_...`
5. Push to `main` → auto-deploy

Live: **https://conduit-api1.onrender.com**

## Environment Variables

| Key | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | Yes | Free key from [console.groq.com/keys](https://console.groq.com/keys) |
| `NODE_ENV` | Auto | Set to `production` by Render |
| `PORT` | Auto | Set by Render (10000) |
| `ALLOWED_ORIGIN` | Optional | Extra CORS origin to whitelist |

## Features

- 🔑 Self-sovereign identity (keypair in browser, never leaves device)
- 💬 Real-time rooms + DMs over WebSocket
- ⚡ AETH token economy (50 post / 20 signal / 10 reply, 2× Pioneer)
- 🤖 Aether AI (Groq llama-3.3-70b, 20 req/min)
- 🔞 Age gate with signed local token
- 📱 PWA — installs on mobile
- 🎯 3-step onboarding for new users
