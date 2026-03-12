# Conduit Identity Protocol

## Overview

Conduit uses a **privacy-first, self-attested age verification** system. No personal data is collected, transmitted, or stored on any server. Verification state is held exclusively in the user's browser `localStorage`.

## Architecture

```
src/identity/
├── AgeVerification.js   # Core token logic (issue, validate, revoke)
├── useAgeGate.js        # React hook for component-level gate state
├── AgeGate.jsx          # Drop-in full-screen verification wall
├── AgeGate.css          # Styles
└── index.js             # Public API exports
```

## Token Structure

```json
{
  "verified": true,
  "timestamp": 1741782000000,
  "salt": "<random 16-byte hex>",
  "sig": "<sha256 of timestamp+salt>",
  "version": "1.0.0"
}
```

- Token is valid for **30 days**, then auto-expires
- Signature prevents trivial localStorage tampering
- No PII is ever included

## Usage

### Wrap a route
```jsx
import { AgeGate } from '../identity';

function ProtectedPage() {
  return (
    <AgeGate minAge={18}>
      <YourContent />
    </AgeGate>
  );
}
```

### Hook usage
```jsx
import { useAgeGate } from '../identity';

function MyComponent() {
  const { verified, confirm, revoke } = useAgeGate();
  // ...
}
```

## Upgrade Path → Zero-Knowledge Proofs

When ready to upgrade to cryptographic age verification:

1. Replace `issueAgeToken()` in `AgeVerification.js` with a **Semaphore** or **Circom** ZKP proof generation call
2. Replace `validateAgeToken()` with on-chain or local proof verification
3. `AgeGate.jsx` and `useAgeGate.js` require **zero changes**

Recommended ZKP libraries:
- [Semaphore](https://semaphore.pse.dev/) — group membership proofs
- [Circom](https://docs.circom.io/) — custom circuit definition
- [snarkjs](https://github.com/iden3/snarkjs) — browser-compatible ZKP runtime
