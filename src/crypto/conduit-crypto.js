/**
 * conduit-crypto.js
 * Client-side ECDSA signing utilities (P-256 / SHA-256)
 * Used for: post signing, DM sender verification, room message verification
 */

export async function generateSigningKeys() {
  const keyPair = await window.crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign', 'verify']
  );
  const pub = await window.crypto.subtle.exportKey('jwk', keyPair.publicKey);
  const priv = await window.crypto.subtle.exportKey('jwk', keyPair.privateKey);
  return {
    publicKey: JSON.stringify(pub),
    privateKey: JSON.stringify(priv),
  };
}

export async function signMessage(message, signingPrivateKeyJson) {
  const jwk = JSON.parse(signingPrivateKeyJson);
  const privKey = await window.crypto.subtle.importKey(
    'jwk', jwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false, ['sign']
  );
  const encoded = new TextEncoder().encode(message);
  const signature = await window.crypto.subtle.sign(
    { name: 'ECDSA', hash: { name: 'SHA-256' } },
    privKey,
    encoded
  );
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

export async function verifyMessage(message, signatureB64, signingPublicKeyJson) {
  const jwk = JSON.parse(signingPublicKeyJson);
  const pubKey = await window.crypto.subtle.importKey(
    'jwk', jwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false, ['verify']
  );
  const encoded = new TextEncoder().encode(message);
  const signature = Uint8Array.from(atob(signatureB64), (c) => c.charCodeAt(0));
  return window.crypto.subtle.verify(
    { name: 'ECDSA', hash: { name: 'SHA-256' } },
    pubKey,
    signature,
    encoded
  );
}

/**
 * Sign a DM payload before sending.
 * Payload must match exactly what the server will verify:
 *   { content, sender_pubkey, recipient_pubkey }
 */
export async function signDMPayload(content, senderPubkey, recipientPubkey, privateKeyJson) {
  const payload = JSON.stringify({ content, sender_pubkey: senderPubkey, recipient_pubkey: recipientPubkey });
  return signMessage(payload, privateKeyJson);
}

/**
 * Sign a room message payload before sending.
 * Payload must match exactly what the server will verify:
 *   { content, sender_pubkey, room_id }
 */
export async function signRoomMessagePayload(content, senderPubkey, roomId, privateKeyJson) {
  const payload = JSON.stringify({ content, sender_pubkey: senderPubkey, room_id: roomId });
  return signMessage(payload, privateKeyJson);
}

/**
 * Generate an age verification token.
 * Token is signed with HMAC-SHA256 using the AGE_TOKEN_SECRET.
 * NOTE: This function is for SERVER-SIDE use only.
 * On the client side, the age gate component should call the /api/age/verify endpoint
 * which will return a signed token to include in subsequent requests.
 */
export function generateAgeTokenClientSide(timestamp, salt) {
  // Client builds the token fields; the server signs and returns the final token.
  // Do NOT attempt to sign here — the HMAC secret is server-only.
  return JSON.stringify({ verified: true, timestamp, salt, sig: null });
}
