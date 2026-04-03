'use strict';
const crypto = require('crypto');
const { webcrypto } = require('crypto');

const AGE_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

// ── Age token: HMAC-SHA256 with AGE_TOKEN_SECRET ───────────────────────────
function verifyAgeToken(raw) {
  if (!raw) return { valid: false, reason: 'missing_token' };
  const secret = process.env.AGE_TOKEN_SECRET;
  if (!secret) {
    console.error('[Auth] AGE_TOKEN_SECRET env var not set — age verification disabled');
    return { valid: false, reason: 'server_misconfigured' };
  }
  try {
    const token = JSON.parse(raw);
    if (!token.verified || !token.timestamp || !token.salt || !token.sig)
      return { valid: false, reason: 'malformed_token' };
    const age = Date.now() - token.timestamp;
    if (age > AGE_TOKEN_TTL_MS) return { valid: false, reason: 'token_expired' };
    if (age < 0) return { valid: false, reason: 'token_future' };
    // FIXED: Use HMAC-SHA256 with a server secret — replaces the old forgeable btoaSig
    const expected = crypto
      .createHmac('sha256', secret)
      .update(`conduit:age_verified:${token.timestamp}:${token.salt}`)
      .digest('hex');
    if (!crypto.timingSafeEqual(Buffer.from(token.sig, 'hex'), Buffer.from(expected, 'hex')))
      return { valid: false, reason: 'invalid_sig' };
    return { valid: true, reason: 'ok' };
  } catch { return { valid: false, reason: 'parse_error' }; }
}

function requireAgeVerified(req, res, next) {
  const raw = req.headers['x-age-token'];
  if (!raw) return res.status(401).json({ error: 'age_verification_required' });
  const result = verifyAgeToken(raw);
  if (!result.valid) return res.status(403).json({ error: 'age_verification_failed', reason: result.reason });
  next();
}

// ── Post/content ECDSA signature verification ─────────────────────────────
async function verifyPostSignature(content, signatureB64, signingPublicKeyJwk) {
  try {
    const subtle = webcrypto.subtle;
    const jwk = JSON.parse(signingPublicKeyJwk);
    const pubKey = await subtle.importKey('jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
    const encoded = new TextEncoder().encode(content);
    const signature = Uint8Array.from(atob(signatureB64), c => c.charCodeAt(0));
    return await subtle.verify({ name: 'ECDSA', hash: { name: 'SHA-256' } }, pubKey, signature, encoded);
  } catch { return false; }
}

// ── DM / room message sender verification ────────────────────────────────
// Verifies that the sender actually controls the pubkey they claim.
// Payload format: { content, sender_pubkey, timestamp } — signed by the sender's private key.
async function verifySenderSignature(payload, signatureB64, senderPublicKeyJwk) {
  try {
    const subtle = webcrypto.subtle;
    const jwk = JSON.parse(senderPublicKeyJwk);
    const pubKey = await subtle.importKey('jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
    const encoded = new TextEncoder().encode(payload);
    const signature = Uint8Array.from(atob(signatureB64), c => c.charCodeAt(0));
    return await subtle.verify({ name: 'ECDSA', hash: { name: 'SHA-256' } }, pubKey, signature, encoded);
  } catch { return false; }
}

// ── Content validation helpers ────────────────────────────────────────────
const LIMITS = {
  post_content: 5000,
  dm_content: 2000,
  room_message_content: 2000,
  reply_content: 2000,
  display_name: 64,
  bio: 500,
  room_name: 80,
  room_description: 500,
};

function validateLength(value, field) {
  const max = LIMITS[field];
  if (!max) return true;
  return typeof value === 'string' && value.length <= max;
}

module.exports = { verifyAgeToken, requireAgeVerified, verifyPostSignature, verifySenderSignature, validateLength, LIMITS };
