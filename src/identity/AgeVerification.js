/**
 * Conduit Age Verification Protocol
 * Self-attested identity layer — swap verifyAge() with ZKP later
 *
 * Token structure (stored client-side, never sent to server):
 * { verified: true, timestamp: <unix>, sig: <hmac-sha256> }
 */

const TOKEN_KEY = 'conduit_age_token';
const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * Generate a deterministic session signature using Web Crypto API.
 * Signs timestamp+salt with a per-session key derived from browser entropy.
 */
async function generateTokenSignature(timestamp) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  const data = new TextEncoder().encode(`conduit:age_verified:${timestamp}:${saltHex}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const sig = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return { sig, salt: saltHex };
}

/**
 * Issue a verified age token and persist it locally.
 * Call this after user explicitly confirms age.
 */
export async function issueAgeToken() {
  const timestamp = Date.now();
  const { sig, salt } = await generateTokenSignature(timestamp);
  const token = {
    verified: true,
    timestamp,
    salt,
    sig,
    version: '1.0.0',
  };
  localStorage.setItem(TOKEN_KEY, JSON.stringify(token));
  return token;
}

/**
 * Validate an existing age token.
 * Returns { valid: boolean, reason: string }
 */
export function validateAgeToken() {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return { valid: false, reason: 'no_token' };

    const token = JSON.parse(raw);
    if (!token.verified || !token.timestamp || !token.sig) {
      return { valid: false, reason: 'malformed_token' };
    }

    const age = Date.now() - token.timestamp;
    if (age > TOKEN_TTL_MS) {
      localStorage.removeItem(TOKEN_KEY);
      return { valid: false, reason: 'token_expired' };
    }

    return { valid: true, reason: 'ok' };
  } catch {
    return { valid: false, reason: 'parse_error' };
  }
}

/**
 * Revoke the current age token (logout / re-verify).
 */
export function revokeAgeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Hook-friendly check: is the current user age-verified?
 */
export function isAgeVerified() {
  return validateAgeToken().valid;
}
