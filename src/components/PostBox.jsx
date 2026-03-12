import React, { useState } from 'react';
import { publishPost } from '../api/gateway.js';
import { getSigningPublicKey } from '../ConduitKeyManager.js';
import { signMessage } from '../crypto/conduit-crypto.js';

export default function PostBox() {
  const [content, setContent] = useState('');
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
      // Sign content with ECDSA P-256 private key
      const signature = await signMessage(content, stored.signingPrivateKey);

      // Send signing public key alongside post so relay can verify
      const signingPublicKey = getSigningPublicKey();

      await publishPost(content, signature, signingPublicKey);
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
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="What's on your mind? (signed + encrypted) — Ctrl+Enter to post"
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
