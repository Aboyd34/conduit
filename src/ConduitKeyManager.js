const KEY_STORE = "conduit_keypair";

export async function generateAndStoreKeys() {
  const ecdhPair = await window.crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveKey", "deriveBits"]
  );

  const ecdsaPair = await window.crypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign", "verify"]
  );

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
  };

  localStorage.setItem(KEY_STORE, JSON.stringify(stored));
  return btoa(ecdsaPub.x + ecdsaPub.y).slice(0, 32);
}

export async function encryptMessage(message) {
  const stored = JSON.parse(localStorage.getItem(KEY_STORE));
  if (!stored) throw new Error("No keys found. Generate keys first.");

  const pubJwk = JSON.parse(stored.publicKey);
  const privJwk = JSON.parse(stored.privateKey);

  const publicKey = await window.crypto.subtle.importKey(
    "jwk", pubJwk,
    { name: "ECDH", namedCurve: "P-256" },
    false, []
  );
  const privateKey = await window.crypto.subtle.importKey(
    "jwk", privJwk,
    { name: "ECDH", namedCurve: "P-256" },
    false, ["deriveKey", "deriveBits"]
  );
  const sharedKey = await window.crypto.subtle.deriveKey(
    { name: "ECDH", public: publicKey },
    privateKey,
    { name: "AES-GCM", length: 256 },
    false, ["encrypt"]
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
    "jwk", pubJwk,
    { name: "ECDH", namedCurve: "P-256" },
    false, []
  );
  const privateKey = await window.crypto.subtle.importKey(
    "jwk", privJwk,
    { name: "ECDH", namedCurve: "P-256" },
    false, ["deriveKey", "deriveBits"]
  );
  const sharedKey = await window.crypto.subtle.deriveKey(
    { name: "ECDH", public: publicKey },
    privateKey,
    { name: "AES-GCM", length: 256 },
    false, ["decrypt"]
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
  try {
    const pub = JSON.parse(stored.signingPublicKey);
    return btoa(pub.x + pub.y).slice(0, 44);
  } catch {
    return btoa(stored.publicKey).slice(0, 44);
  }
}
