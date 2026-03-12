# Security Policy

## Supported Versions

| Version | Supported |
|---------|----------|
| 0.1.x   | ✅ Active  |

## Reporting a Vulnerability

Conduit is a privacy-first project. Security is our highest priority.

**Do NOT open a public GitHub Issue for security vulnerabilities.**

Instead:
1. Go to the GitHub repo
2. Click **Security** tab
3. Click **Report a vulnerability**
4. Describe the issue in detail

We will respond within **48 hours** and work with you on a fix before any public disclosure.

## Security Design Principles

- All messages are signed with the sender's private key before publishing
- Keys are generated and stored locally only (never sent to any server)
- No email, no password, no identity — only cryptographic keypairs
- All data is ephemeral by default (in-memory, clears on restart)
- No telemetry, no analytics, no third-party tracking
- Rate limiting on all API endpoints
- Helmet.js security headers on all servers

## Cryptographic Stack
- **Key Exchange**: X25519 (libsodium)
- **Encryption**: AES-256-GCM (libsodium crypto_box_seal)
- **Signing**: Ed25519 (libsodium crypto_sign_detached)
- **Hashing**: SHA-256
