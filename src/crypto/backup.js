/**
 * Conduit Encrypted Backup System
 *
 * Export flow:
 *   1. Collect posts + metadata from memory/localStorage
 *   2. Derive an AES-GCM key from the user's ECDH private key (PBKDF2-style via HKDF)
 *   3. Encrypt the bundle → download as .aether file
 *
 * Key export flow:
 *   1. Export keypair as JSON
 *   2. Encrypt that JSON with a user-chosen passphrase (PBKDF2 + AES-GCM)
 *   3. Download as .aetherkey file
 *
 * Restore flow:
 *   1. User uploads .aetherkey → decrypts with passphrase → keys restored to localStorage
 *   2. User uploads .aether bundle → decrypts with restored keys → history restored
 */

const KEY_STORE      = 'conduit_keypair';
const BACKUP_VERSION = 1;

// ------------------------------------------------------------------ helpers

function b64(buf) { return btoa(String.fromCharCode(...new Uint8Array(buf))); }
function unb64(s) { return Uint8Array.from(atob(s), c => c.charCodeAt(0)); }

async function pbkdf2Key(passphrase, salt) {
  const enc  = new TextEncoder();
  const base = await crypto.subtle.importKey('raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 310_000, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function aesEncrypt(key, plaintext) {
  const iv  = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder().encode(typeof plaintext === 'string' ? plaintext : JSON.stringify(plaintext));
  const ct  = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc);
  return { iv: b64(iv), ct: b64(ct) };
}

async function aesDecrypt(key, iv, ct) {
  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: unb64(iv) },
    key,
    unb64(ct)
  );
  return new TextDecoder().decode(plain);
}

/** Derive a symmetric AES key from the stored ECDH private key bytes */
async function keyFromECDH() {
  const stored  = JSON.parse(localStorage.getItem(KEY_STORE));
  if (!stored)  throw new Error('No keypair found');
  const privJwk = JSON.parse(stored.privateKey);
  // Use the raw 'd' scalar of the JWK as key material
  const raw = unb64(privJwk.d.replace(/-/g, '+').replace(/_/g, '/'));
  const base = await crypto.subtle.importKey('raw', raw, { name: 'HKDF' }, false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(32), info: new TextEncoder().encode('conduit-backup-v1') },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// ------------------------------------------------------------------ download helper

function downloadFile(filename, content, mime = 'application/octet-stream') {
  const blob = new Blob([content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
}

// ------------------------------------------------------------------ PUBLIC API

/**
 * Export an encrypted .aether bundle of all user posts + metadata.
 * @param {Array}  posts        - array of post objects from the feed
 * @param {string} displayName  - optional display name / basename
 */
export async function exportBackup(posts, displayName = 'conduit') {
  const stored  = JSON.parse(localStorage.getItem(KEY_STORE));
  if (!stored)  throw new Error('No keypair — cannot create backup');

  const pubkey  = stored.identityFingerprint;
  const myPosts = posts.filter(p => p.displaySender === pubkey || p.sender === pubkey);

  const bundle  = {
    version:   BACKUP_VERSION,
    pubkey,
    exportedAt: new Date().toISOString(),
    postCount:  myPosts.length,
    posts:      myPosts,
  };

  const aesKey   = await keyFromECDH();
  const { iv, ct } = await aesEncrypt(aesKey, bundle);

  const file = JSON.stringify({ v: BACKUP_VERSION, pubkey, iv, ct });
  downloadFile(`${displayName}-backup-${Date.now()}.aether`, file, 'application/json');
  return myPosts.length;
}

/**
 * Decrypt and parse a .aether backup file.
 * Returns the bundle object or throws.
 */
export async function importBackup(fileText) {
  const { v, iv, ct } = JSON.parse(fileText);
  if (v !== BACKUP_VERSION) throw new Error(`Unknown backup version: ${v}`);
  const aesKey = await keyFromECDH();
  const plain  = await aesDecrypt(aesKey, iv, ct);
  return JSON.parse(plain); // { version, pubkey, exportedAt, posts }
}

/**
 * Export keypair encrypted with a user passphrase → .aetherkey file
 */
export async function exportKeys(passphrase, displayName = 'conduit') {
  if (!passphrase || passphrase.length < 8) throw new Error('Passphrase must be at least 8 characters');
  const stored = localStorage.getItem(KEY_STORE);
  if (!stored) throw new Error('No keypair found');

  const salt       = crypto.getRandomValues(new Uint8Array(16));
  const aesKey     = await pbkdf2Key(passphrase, salt);
  const { iv, ct } = await aesEncrypt(aesKey, stored); // encrypt the whole keypair JSON

  const file = JSON.stringify({ v: BACKUP_VERSION, salt: b64(salt), iv, ct });
  downloadFile(`${displayName}-keys-${Date.now()}.aetherkey`, file, 'application/json');
}

/**
 * Import a .aetherkey file and restore keys to localStorage.
 * Returns the identity fingerprint on success.
 */
export async function importKeys(fileText, passphrase) {
  const { v, salt, iv, ct } = JSON.parse(fileText);
  if (v !== BACKUP_VERSION) throw new Error(`Unknown key file version: ${v}`);
  const aesKey  = await pbkdf2Key(passphrase, unb64(salt));
  let plain;
  try {
    plain = await aesDecrypt(aesKey, iv, ct);
  } catch {
    throw new Error('Wrong passphrase — decryption failed');
  }
  const keypair = JSON.parse(plain);
  localStorage.setItem(KEY_STORE, JSON.stringify(keypair));
  return keypair.identityFingerprint;
}
