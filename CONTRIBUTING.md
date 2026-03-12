# Contributing to Conduit

Welcome! Conduit is an open source, privacy-first decentralized social network. We appreciate every contribution.

## Getting Started

1. Fork the repo
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/conduit`
3. Install dependencies: `npm install && cd gateway && npm install && cd ..`
4. Copy env: `cp .env.example .env`
5. Run locally: `npm run dev:all`
6. Open `http://localhost:5173`

## How to Contribute

### Reporting Bugs
- Open a GitHub Issue
- Include steps to reproduce
- Include your OS, Node version, and browser

### Submitting Code
- Create a branch: `git checkout -b feature/your-feature-name`
- Make your changes
- Commit with a clear message: `git commit -m "feat: describe what you did"`
- Push and open a Pull Request against `main`

### Commit Message Format
```
feat: add new feature
fix: fix a bug
docs: update documentation
refactor: restructure code without changing behavior
test: add or update tests
```

## Code Standards
- JavaScript/JSX for frontend components
- TypeScript for backend server
- Keep privacy-first: no tracking, no telemetry, no third-party analytics
- All posts must be signed before publishing
- Never log user content or public keys to external services

## Priority Areas (Q1)
- [ ] WebSocket real-time layer
- [ ] P2P transport via libp2p
- [ ] ActivityPub federation
- [ ] Mobile-responsive UI improvements
- [ ] Test coverage

## Questions?
Open a GitHub Discussion or file an Issue.
