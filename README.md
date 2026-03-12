# ⚡ Conduit

> Communication without witnesses.

Conduit is a privacy-first, decentralized social network. Messages pass through nodes — nothing is stored permanently. No metadata. No central servers. No identity required.

## Stack
- **Frontend**: React 19 + Vite
- **Backend**: Express + TypeScript (ephemeral SQLite in-memory)
- **Gateway**: Node.js API bridge
- **Crypto**: libsodium (X25519 + AES-256-GCM)

## Quick Start

```bash
# Install dependencies
npm install
cd gateway && npm install && cd ..

# Copy env
cp .env.example .env

# Run everything
npm run dev:all
```

Open **http://localhost:5173**

## Q1 Milestones
- [x] Key generation (X25519 via libsodium)
- [x] Message signing before publish
- [x] Ephemeral gateway (in-memory, clears on restart)
- [x] Live feed (polls every 10 seconds)
- [x] Peer registration
- [ ] WebSocket real-time layer
- [ ] P2P transport (libp2p)
- [ ] ActivityPub federation
- [ ] Persistent optional storage
- [ ] Mobile client

## License
MIT
