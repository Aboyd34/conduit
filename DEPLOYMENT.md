# Conduit Deployment Guide

Conduit uses a **two-service architecture**. Vercel handles the frontend. A separate backend host handles the API, WebSockets, and SQLite.

---

## Why two services?

| Requirement | Vercel | Needs separate host |
|---|---|---|
| React/Vite frontend | ✅ | — |
| Static file serving | ✅ | — |
| Express HTTP API | ❌ Serverless only | ✅ |
| WebSockets (`ws`) | ❌ Not supported | ✅ |
| SQLite (`sqlite3`) | ❌ No persistent disk | ✅ |

---

## Service 1 — Frontend (Vercel)

### Setup
1. Connect your GitHub repo to [vercel.com](https://vercel.com)
2. Framework preset: **Vite**
3. Build command: `vite build`
4. Output directory: `dist`

### Environment variables (Vercel dashboard)
```
VITE_API_URL=https://your-backend-host.com
VITE_WS_URL=wss://your-backend-host.com
VITE_CHAIN_ID=8453
VITE_ALCHEMY_API_KEY=your_key
VITE_WALLETCONNECT_PROJECT_ID=your_id
```

### Update vercel.json
After setting up your backend, replace `your-backend-host.com` in `vercel.json` with your actual backend URL:
```json
{ "source": "/api/:path*", "destination": "https://YOUR_BACKEND_URL/api/:path*" }
```

---

## Service 2 — Backend (Railway / Fly.io / Render)

The backend requires a host that supports:
- Persistent disk (SQLite file)
- Long-lived HTTP connections (WebSockets)
- Node.js process that stays running

### Recommended free-tier options
| Host | Free tier | WebSocket | Persistent disk | Notes |
|---|---|---|---|---|
| **Railway** | $5 credit/mo | ✅ | ✅ | Easiest setup |
| **Fly.io** | 3 VMs free | ✅ | ✅ | Best performance |
| **Render** | 750hrs/mo | ✅ | ✅ | Spins down after 15min idle on free tier |

### Environment variables (backend host dashboard)
```
PORT=10000
NODE_ENV=production
AGE_TOKEN_SECRET=<run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
GROQ_API_KEY=your_groq_key
ALLOWED_ORIGIN=https://your-vercel-app.vercel.app
```

### Start command
```
node server/index.js
```

### Railway setup (recommended)
1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select the `conduit` repo
3. Add the env vars above
4. Set start command: `node server/index.js`
5. Add a Volume (for SQLite persistence) mounted at `/app/data`
6. Copy the Railway URL → paste into `VITE_API_URL` in Vercel

---

## Local development
```bash
# Terminal 1 — frontend
npm run dev

# Terminal 2 — backend
npm run dev:server
```

Create a `.env` file in root:
```
PORT=3001
AGE_TOKEN_SECRET=dev-secret-change-in-production
GROQ_API_KEY=your_key
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```
