// Using CJS-compatible libsodium import for Vite compatibility
let sodiumReady = null;

async function getSodium() {
  if (!sodiumReady) {
    const sodium = await import("libsodium-wrappers");
    await sodium.default.ready;
    sodiumReady = sodium.default;
  }
  return sodiumReady;
}

const KEY_STORE = "conduit_keypair";

export async function generateAndStoreKeys() {
  const sodium = await getSodium();
  const keypair = sodium.crypto_box_keypair();
  const stored = {
    publicKey: sodium.to_base64(keypair.publicKey),
    privateKey: sodium.to_base64(keypair.privateKey),
  };
  localStorage.setItem(KEY_STORE, JSON.stringify(stored));
  return stored.publicKey;
}

export async function encryptMessage(message) {
  const sodium = await getSodium();
  const stored = JSON.parse(localStorage.getItem(KEY_STORE));
  if (!stored) throw new Error("No keys found. Generate keys first.");
  const pubKey = sodium.from_base64(stored.publicKey);
  const encrypted = sodium.crypto_box_seal(sodium.from_string(message), pubKey);
  return sodium.to_base64(encrypted);
}

export async function decryptMessage(cipherB64) {
  const sodium = await getSodium();
  const stored = JSON.parse(localStorage.getItem(KEY_STORE));
  if (!stored) throw new Error("No keys found.");
  const pub = sodium.from_base64(stored.publicKey);
  const priv = sodium.from_base64(stored.privateKey);
  const cipher = sodium.from_base64(cipherB64);
  const decrypted = sodium.crypto_box_seal_open(cipher, pub, priv);
  return sodium.to_string(decrypted);
}

export function deleteKeys() {
  localStorage.removeItem(KEY_STORE);
}

export function getPublicKey() {
  const stored = JSON.parse(localStorage.getItem(KEY_STORE));
  return stored ? stored.publicKey : null;
}
