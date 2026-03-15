import React, { useState } from 'react';
import { broadcastPost } from '../api/gateway.js';
import { getSigningPublicKey, getPublicKey } from '../ConduitKeyManager.js';
import { signMessage } from '../crypto/conduit-crypto.js';

const ROOMS = [
  { id: 'public', label: '# general' },
  { id: 'crypto', label: '# crypto' },
  { id: 'tech', label: '# tech' },
  { id: 'random', label: '# random' },
];

export default function PostBox() {
  const [content, setContent] = useState('');
  const [topic, setTopic] = useState('public');
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    const stored = JSON.parse(localStorage.getItem('conduit_keypair'));
    if (!stored) {
      setStatus('⚠️ Generate keys first.');
      return;
    }
    if (!stored.signingPrivateKey) {
      setStatus('⚠️ Old keys detected. Delete keys and generate new ones.');
      return;
    }

    setSending(true);
    setStatus('');

    try {
      const signature = await signMessage(content, stored.signingPrivateKey);
      // sender = signing public key JWK (for server verification)
      // display name in feed uses identityFingerprint via SenderName
      const signingPublicKey = getSigningPublicKey();
      const fingerprint = getPublicKey(); // short display key

      await broadcastPost({
        id: crypto.randomUUID(),
        topic,
        sender: signingPublicKey,      // full JWK — server needs this to verify
        displaySender: fingerprint,    // short fingerprint — shown in feed
        content,
        signature,
        timestamp: Date.now(),
      });

      setContent('');
      setStatus('✅ Post published.');
    } catch (e) {
      setStatus('❌ Failed: ' + e.message);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit();
  };

  return (
    <div className="post-box">
      <div className="post-box-room-select">
        {ROOMS.map((r) => (
          <button
            key={r.id}
            className={`room-btn ${topic === r.id ? 'room-btn--active' : ''}`}
            onClick={() => setTopic(r.id)}
          >
            {r.label}
          </button>
        ))}
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={`Posting to ${ROOMS.find(r => r.id === topic)?.label} — Ctrl+Enter to post`}
        rows={3}
        disabled={sending}
      />
      <button onClick={handleSubmit} disabled={sending}>
        {sending ? 'Publishing…' : 'Publish Post'}
      </button>
      {status && <p className="status">{status}</p>}
    </div>
  );
}
