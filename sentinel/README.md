# Conduit Sentinel ⚡

The Sentinel is Conduit's always-on watchdog agent. It monitors the full stack, diagnoses failures, and auto-heals without manual intervention.

## What It Watches

| Target | Check | Heal Action |
|---|---|---|
| `server.ts` process | HTTP `/api/health` | Restart process |
| WebSocket `/ws` | WS connection test | Restart server |
| Vite dev server | Process alive | Restart Vite |
| Missing dependencies | stderr pattern match | `npm install` |
| Port conflicts | stderr pattern match | Report + restart |

## How to Run

```bash
# Run Sentinel (it starts server + vite automatically)
node sentinel/conduit-sentinel.js
```

## Logs

All events written to `sentinel.log` in the project root.

```
[2026-03-12T...] [SENTINEL] [BOOT] Conduit Sentinel starting ⚡
[2026-03-12T...] [SENTINEL] [CHECK] Health: HTTP=OK WS=OK
[2026-03-12T...] [SENTINEL] [HEAL] Running npm install...
[2026-03-12T...] [SENTINEL] [HEAL] Restarting conduit-server (attempt 1/5)...
```

## Config

Edit the `CONFIG` object in `conduit-sentinel.js`:

```js
const CONFIG = {
  serverPort: 3000,
  vitePort: 5173,
  checkIntervalMs: 10_000,  // how often to check
  maxRestarts: 5,           // before giving up
  restartWindowMs: 60_000,  // restart count reset window
};
```

## Architecture

```
Conduit Sentinel
  ├── ConduitProcess (server)  ← spawns + monitors tsx server.ts
  ├── ConduitProcess (vite)    ← spawns + monitors vite
  ├── Diagnosis Engine         ← reads stderr, maps to heal action
  ├── HTTP Health Check        ← polls /api/health every 10s
  └── WebSocket Health Check   ← tests ws://localhost:3000/ws
```

## Future: Conductor Integration

The Sentinel is designed as the foundation for the Conduit Conductor.
All agent events will route through Sentinel's health loop.
