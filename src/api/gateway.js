// Auto-detect API base URL — works on localhost and any deployed host
import { getSigningPublicKey } from '../ConduitKeyManager.js';

const PRODUCTION_API_URL = 'https://conduit-api1.onrender.com';

function getDefaultApiUrl() {
  if (typeof window === 'undefined') return '';
  if (import.meta.env.DEV || window.location.hostname === 'localhost') {
    return 'http://localhost:3001';
  }
  if (window.location.hostname === new URL(PRODUCTION_API_URL).hostname) {
    return window.location.origin;
  }
  return PRODUCTION_API_URL;
}

const BASE = import.meta.env.VITE_API_URL || getDefaultApiUrl();

function getSender() {
  const sender = getSigningPublicKey();
  if (!sender) throw new Error('No signing key found');
  return sender;
}

function getAgeToken() {
  return localStorage.getItem('conduit_age_token') || '';
}

function headers() {
  return {
    'Content-Type': 'application/json',
    'x-age-token': getAgeToken(),
  };
}

export async function broadcastPost(post) {
  const res = await fetch(`${BASE}/api/relay/broadcast`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(post),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Broadcast failed');
  }
  return res.json();
}

export async function broadcastSignal(postId) {
  const res = await fetch(`${BASE}/api/relay/${encodeURIComponent(postId)}/signal`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ sender: getSender() }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Signal failed');
  }
  return res.json();
}

export async function broadcastAmplify(postId, amplifierPubkey) {
  const res = await fetch(`${BASE}/api/relay/${encodeURIComponent(postId)}/amplify`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ sender: amplifierPubkey || getSender() }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Amplify failed');
  }
  return res.json();
}

export async function fetchFeed() {
  const res = await fetch(`${BASE}/api/relay/feed`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error('Feed fetch failed');
  return res.json();
}

export async function registerPeer(pubkey) {
  const res = await fetch(`${BASE}/api/peers`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ pubkey, status: 'online' }),
  });
  if (!res.ok) throw new Error('Peer registration failed');
  return res.json();
}

export async function fetchPeers() {
  const res = await fetch(`${BASE}/api/peers`, { headers: headers() });
  if (!res.ok) throw new Error('Peer fetch failed');
  return res.json();
}
