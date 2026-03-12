// Native Web Crypto API - no external dependencies, built into every browser

const KEY_STORE = "conduit_keypair";

export async function generateAndStoreKeys() {
  const keyPair = await window.crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveKey", "deriveBits"]
  );

  const publicKeyExported = await window.crypto.subtle.exportKey("jwk", keyPair.publicKey);
  const privateKeyExported = await window.crypto.subtle.exportKey("jwk", keyPair.privateKey);

  const stored = {
    publicKey: JSON.stringify(publicKeyExported),
    privateKey: JSON.stringify(privateKeyExported),
  };

  localStorage.setItem(KEY_STORE, JSON.stringify(stored));
  return btoa(JSON.stringify(publicKeyExported)).slice(0, 32);
}

export async function encryptMessage(message) {
  const stored = JSON.parse(localStorage.getItem(KEY_STORE));
  if (!stored) throw new Error("No keys found. Generate keys first.");

  const pubJwk = JSON.parse(stored.publicKey);
  const publicKey = await window.crypto.subtle.importKey(
    "jwk", pubJwk, { name: "ECDH", namedCurve: "P-256" }, false, []
  );

  const privJwk = JSON.parse(stored.privateKey);
  const privateKey = await window.crypto.subtle.importKey(
    "jwk", privJwk, { name: "ECDH", namedCurve: "P-256" }, false, ["deriveKey", "deriveBits"]
  );

  const sharedKey = await window.crypto.subtle.deriveKey(
    { name: "ECDH", public: publicKey },
    privateKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
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
  const publicKey = await window.crypto.subtle.importKey(
    "jwk", pubJwk, { name: "ECDH", namedCurve: "P-256" }, false, []
  );

  const privJwk = JSON.parse(stored.privateKey);
  const privateKey = await window.crypto.subtle.importKey(
    "jwk", privJwk, { name: "ECDH", namedCurve: "P-256" }, false, ["deriveKey", "deriveBits"]
  );

  const sharedKey = await window.crypto.subtle.deriveKey(
    { name: "ECDH", public: publicKey },
    privateKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
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
  return btoa(stored.publicKey).slice(0, 44);
}
