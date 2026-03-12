const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || "http://localhost:4000";

export async function fetchFeed() {
  const res = await fetch(`${GATEWAY_URL}/api/feed`);
  if (!res.ok) throw new Error("Feed fetch failed");
  return res.json();
}

export async function publishPost(content, signature, senderPubKey) {
  const res = await fetch(`${GATEWAY_URL}/api/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content,
      signature,
      sender: senderPubKey,
      timestamp: Date.now(),
      id: crypto.randomUUID(),
      topic: "public",
    }),
  });
  return res.json();
}

export async function fetchPeers() {
  const res = await fetch(`${GATEWAY_URL}/api/peers`);
  return res.json();
}

export async function registerPeer(pubKey) {
  const res = await fetch(`${GATEWAY_URL}/api/peers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pubkey: pubKey, status: "online" }),
  });
  return res.json();
}
