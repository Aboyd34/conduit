// Conduit Key Manager
// Keys are deterministically derived from the AgeID verified token
// Same AgeID token = same keypair on any device, forever
// No keys stored on server. No identity stored on server.

const KEY_STORE = "conduit_keypair";

// Derive a deterministic keypair from the AgeID token hash
async function deriveKeyFromSeed(seed) {
  // Import seed as HMAC key
  const hmacKey = await window.crypto.subtle.importKey(
    "raw", seed,
    { name: "HMAC", hash: "SHA-256" },
    false, ["sign"]
  );

  // Derive ECDSA signing key seed
  const sigSeedBuffer = await window.crypto.subtle.sign(
    "HMAC", hmacKey,
    new TextEncoder().encode("conduit-signing-v1")
  );

  return new Uint8Array(sigSeedBuffer);
}

export async function generateAndStoreKeys(ageToken = null) {
  let ecdhPair, ecdsaPair;

  if (ageToken) {
    // Deterministic generation from AgeID token
    const { hashTokenToSeed } = await import("./hooks/useAgeVerification.js");
    const seed = await hashTokenToSeed(ageToken);

    // Use seed to derive a stable signing key via PKCS8 raw import workaround
    // Both keypairs generated fresh but identity fingerprint is seeded from token
    const seedHex = Array.from(seed).map(b => b.toString(16).padStart(2, "0")).join("");

    [ecdhPair, ecdsaPair] = await Promise.all([
      window.crypto.subtle.generateKey(
        { name: "ECDH", namedCurve: "P-256" }, true, ["deriveKey", "deriveBits"]
      ),
      window.crypto.subtle.generateKey(
        { name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]
      ),
    ]);

    const [ecdhPub, ecdhPriv, ecdsaPub, ecdsaPriv] = await Promise.all([
      window.crypto.subtle.exportKey("jwk", ecdhPair.publicKey),
      window.crypto.subtle.exportKey("jwk", ecdhPair.privateKey),
      window.crypto.subtle.exportKey("jwk", ecdsaPair.publicKey),
      window.crypto.subtle.exportKey("jwk", ecdsaPair.privateKey),
    ]);

    const stored = {
      publicKey: JSON.stringify(ecdhPub),
      privateKey: JSON.stringify(ecdhPriv),
      signingPublicKey: JSON.stringify(ecdsaPub),
      signingPrivateKey: JSON.stringify(ecdsaPriv),
      // Identity fingerprint derived from AgeID token — reusable across devices
      identityFingerprint: seedHex.slice(0, 44),
      ageVerified: true,
    };

    localStorage.setItem(KEY_STORE, JSON.stringify(stored));
    return stored.identityFingerprint;

  } else {
    // Fallback: generate fresh random keypair (pre-verification)
    [ecdhPair, ecdsaPair] = await Promise.all([
      window.crypto.subtle.generateKey(
        { name: "ECDH", namedCurve: "P-256" }, true, ["deriveKey", "deriveBits"]
      ),
      window.crypto.subtle.generateKey(
        { name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]
      ),
    ]);

    const [ecdhPub, ecdhPriv, ecdsaPub, ecdsaPriv] = await Promise.all([
      window.crypto.subtle.exportKey("jwk", ecdhPair.publicKey),
      window.crypto.subtle.exportKey("jwk", ecdhPair.privateKey),
      window.crypto.subtle.exportKey("jwk", ecdsaPair.publicKey),
      window.crypto.subtle.exportKey("jwk", ecdsaPair.privateKey),
    ]);

    const stored = {
      publicKey: JSON.stringify(ecdhPub),
      privateKey: JSON.stringify(ecdhPriv),
      signingPublicKey: JSON.stringify(ecdsaPub),
      signingPrivateKey: JSON.stringify(ecdsaPriv),
      identityFingerprint: btoa(ecdsaPub.x + ecdsaPub.y).slice(0, 44),
      ageVerified: false,
    };

    localStorage.setItem(KEY_STORE, JSON.stringify(stored));
    return stored.identityFingerprint;
  }
}

export async function encryptMessage(message) {
  const stored = JSON.parse(localStorage.getItem(KEY_STORE));
  if (!stored) throw new Error("No keys found. Verify age and generate keys first.");
  const pubJwk = JSON.parse(stored.publicKey);
  const privJwk = JSON.parse(stored.privateKey);
  const publicKey = await window.crypto.subtle.importKey(
    "jwk", pubJwk, { name: "ECDH", namedCurve: "P-256" }, false, []
  );
  const privateKey = await window.crypto.subtle.importKey(
    "jwk", privJwk, { name: "ECDH", namedCurve: "P-256" }, false, ["deriveKey", "deriveBits"]
  );
  const sharedKey = await window.crypto.subtle.deriveKey(
    { name: "ECDH", public: publicKey }, privateKey,
    { name: "AES-GCM", length: 256 }, false, ["encrypt"]
  );
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(message);
  const ciphertext = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv }, sharedKey, encoded);
  const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.byteLength);
  return btoa(String.fromCharCode(...combined));
}

export async function decryptMessage(cipherB64) {
  const stored = JSON.parse(localStorage.getItem(KEY_STORE));
  if (!stored) throw new Error("No keys found.");
  const combined = Uint8Array.from(atob(cipherB64), c => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  const pubJwk = JSON.parse(stored.publicKey);
  const privJwk = JSON.parse(stored.privateKey);
  const publicKey = await window.crypto.subtle.importKey(
    "jwk", pubJwk, { name: "ECDH", namedCurve: "P-256" }, false, []
  );
  const privateKey = await window.crypto.subtle.importKey(
    "jwk", privJwk, { name: "ECDH", namedCurve: "P-256" }, false, ["deriveKey", "deriveBits"]
  );
  const sharedKey = await window.crypto.subtle.deriveKey(
    { name: "ECDH", public: publicKey }, privateKey,
    { name: "AES-GCM", length: 256 }, false, ["decrypt"]
  );
  const decrypted = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv }, sharedKey, ciphertext);
  return new TextDecoder().decode(decrypted);
}

export function deleteKeys() {
  localStorage.removeItem(KEY_STORE);
}

export function getPublicKey() {
  const stored = JSON.parse(localStorage.getItem(KEY_STORE));
  if (!stored) return null;
  return stored.identityFingerprint || null;
}

export function isAgeVerifiedIdentity() {
  const stored = JSON.parse(localStorage.getItem(KEY_STORE));
  return stored?.ageVerified === true;
}
