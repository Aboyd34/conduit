/**
 * Conduit Gateway API Client
 * Auto-attaches X-Age-Token to all protected requests.
 */

const BASE = import.meta.env?.VITE_GATEWAY_URL || 'http://localhost:3000';

function getAgeTokenHeader() {
  const raw = localStorage.getItem('conduit_age_token');
  return raw ? { 'X-Age-Token': raw } : {};
}

const baseHeaders = () => ({
  'Content-Type': 'application/json',
  ...getAgeTokenHeader(),
});

export async function registerPeer(pubkey) {
  const res = await fetch(`${BASE}/api/peers`, {
    method: 'POST',
    headers: baseHeaders(),
    body: JSON.stringify({ pubkey, status: 'online' }),
  });
  if (!res.ok) throw new Error(`registerPeer failed: ${res.status}`);
  return res.json();
}

export async function fetchFeed() {
  const res = await fetch(`${BASE}/api/relay/feed`, {
    headers: baseHeaders(),
  });
  if (!res.ok) throw new Error(`fetchFeed failed: ${res.status}`);
  return res.json();
}

export async function broadcastPost(post) {
  const res = await fetch(`${BASE}/api/relay/broadcast`, {
    method: 'POST',
    headers: baseHeaders(),
    body: JSON.stringify(post),
  });
  if (!res.ok) throw new Error(`broadcastPost failed: ${res.status}`);
  return res.json();
}

/**
 * publishPost — builds and broadcasts a signed post with topic support.
 */
export async function publishPost(content, signature, senderPubkey, topic = 'public') {
  const post = {
    id: crypto.randomUUID(),
    topic,
    sender: senderPubkey,
    content,
    signature,
    timestamp: Date.now(),
  };
  return broadcastPost(post);
}

export async function fetchPeers() {
  const res = await fetch(`${BASE}/api/peers`, {
    headers: baseHeaders(),
  });
  if (!res.ok) throw new Error(`fetchPeers failed: ${res.status}`);
  return res.json();
}

export async function fetchCommunities() {
  const res = await fetch(`${BASE}/api/communities`, {
    headers: baseHeaders(),
  });
  if (!res.ok) throw new Error(`fetchCommunities failed: ${res.status}`);
  return res.json();
}

export async function createCommunity(community) {
  const res = await fetch(`${BASE}/api/communities`, {
    method: 'POST',
    headers: baseHeaders(),
    body: JSON.stringify(community),
  });
  if (!res.ok) throw new Error(`createCommunity failed: ${res.status}`);
  return res.json();
}
