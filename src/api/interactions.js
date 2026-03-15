const BASE = import.meta.env.VITE_API_URL || '';

function getAgeToken() {
  return localStorage.getItem('conduit_age_token') || '';
}

function headers() {
  return {
    'Content-Type': 'application/json',
    'x-age-token': getAgeToken(),
  };
}

export async function sendReply(postId, content, senderPubkey) {
  const res = await fetch(`${BASE}/api/relay/${postId}/reply`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ content, sender: senderPubkey }),
  });
  if (!res.ok) throw new Error('Reply failed');
  return res.json();
}

export async function sendSignal(postId, senderPubkey) {
  const res = await fetch(`${BASE}/api/relay/${postId}/signal`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ sender: senderPubkey }),
  });
  if (!res.ok && res.status !== 409) throw new Error('Signal failed');
  return res.json();
}

export async function sendAmplify(postId, senderPubkey) {
  const res = await fetch(`${BASE}/api/relay/${postId}/amplify`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ sender: senderPubkey }),
  });
  if (!res.ok && res.status !== 409) throw new Error('Amplify failed');
  return res.json();
}
