# ⚡ Conduit

> **Communication without witnesses.**

Conduit is a privacy-first communication platform. No accounts. No data stored on the server. Your identity is generated locally in your browser — the relay never knows who you are.

🌐 **Live:** [cantc-ulive.live](https://cantc-ulive.live)
📄 **About:** [cantc-ulive.live/about.html](https://cantc-ulive.live/about.html)

---

## How it works

- **Local identity** — Ed25519 keypair generated in-browser on first visit. Never transmitted.
- **Relay-only architecture** — Posts are signed and forwarded. The relay does not store your identity.
- **No accounts** — No email, no password, no profile owned by anyone but you.
- **Browser key storage** — All identity material lives in `localStorage`. Clearing your browser removes it.
- **Optional encryption** — Encrypt post content before relay. Only the recipient can read it.

---

## Rooms

| Room | Access | Description |
|---|---|---|
| `#general` | Open | Everyone welcome |
| `#crypto` | Open | Web3, wallets, on-chain talk |
| `#tech` | Open | Builders, devs, tools |
| `#random` | Open | Anything goes |
| `#aether` | 100 AETH | Holders only — governance, drops, exclusive tools |

---

## Tech stack

- **Frontend** — React 19, Vite, custom inline SVG icon system
- **Backend** — Node.js, Express, WebSocket relay
- **Storage** — SQLite (relay buffer only, no identity data)
- **Web3** — wagmi, viem, OnchainKit (Base)
- **Identity** — Browser Web Crypto API, Ed25519, localStorage
- **Hosting** — Render (auto-deploy from `main`)

---

## Project structure

```
src/
  App.jsx                  # Main shell, nav, layout
  components/
    ConduitIcons.jsx        # Custom inline SVG icon system
    RoomsView.jsx           # 4-layer room environment
    roomModules.js          # Room data + helpers
    EncryptionSettings.jsx  # User encryption panel
    Feed.jsx                # Main post feed
    PostBox.jsx             # Post composer
    PostCard.jsx            # Post display + actions
    AetherRoom.jsx          # Holder-only room
    YouView.jsx             # Identity, keys, privacy
    PulseView.jsx           # Activity stream
    SearchView.jsx          # Search
    AirdropPage.jsx         # AETH claim UI
    NotificationsView.jsx   # Alerts
  hooks/
    useConduitSocket.js     # WebSocket connection
    useNotifications.js     # Notification state
  identity/                 # Age gate, identity system
  crypto/                   # Key management
  api/                      # Gateway, peer registration
  providers/
    Web3Provider.jsx        # wagmi / wallet context
server.ts                   # Express + WebSocket relay
render.yaml                 # Render deploy config
```

---

## Aether token model

| Bucket | % | Purpose |
|---|---|---|
| Ecosystem reserve | 40% | Rewards, growth, partnerships |
| Founder allocation | 25% | Builder upside, long-term ownership |
| Treasury / runway | 20% | Hosting, ops, development |
| Early supporters | 10% | Builders, collaborators, early believers |
| Community rewards | 5% | Activity, referrals, participation |

---

## Founder

Conduit was built independently by a single founder in early 2026.
The goal: build something that treats users as owners of their own data — not as the product.

📄 [Read the full founder memo →](./FOUNDER.md)

---

## License

MIT
