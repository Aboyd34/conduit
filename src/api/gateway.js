// Auto-detect API base URL — works on localhost and any deployed host
const BASE = import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' ? window.location.origin : '');

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
