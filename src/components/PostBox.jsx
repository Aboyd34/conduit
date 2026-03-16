import React, { useState, useRef } from 'react';
import { broadcastPost } from '../api/gateway.js';
import { getSigningPublicKey, getPublicKey } from '../ConduitKeyManager.js';
import { signMessage } from '../crypto/conduit-crypto.js';

const ROOMS = [
  { id: 'public', label: '# general' },
  { id: 'crypto', label: '# crypto' },
  { id: 'tech',   label: '# tech' },
  { id: 'random', label: '# random' },
];

const MAX_CHARS = 500;

export default function PostBox({ defaultTopic = 'public', onPosted }) {
  const [content,  setContent]  = useState('');
  const [topic,    setTopic]    = useState(defaultTopic);
  const [status,   setStatus]   = useState('');
  const [sending,  setSending]  = useState(false);
  const [focused,  setFocused]  = useState(false);
  const textareaRef = useRef(null);

  const charsLeft = MAX_CHARS - content.length;
  const overLimit = charsLeft < 0;

  const handleSubmit = async () => {
    if (!content.trim() || sending || overLimit) return;

    const stored = JSON.parse(localStorage.getItem('conduit_keypair') || 'null');
    if (!stored) {
      setStatus('⚠️ No keys found. Visit the You tab to generate keys.');
      return;
    }
    if (!stored.signingPrivateKey) {
      setStatus('⚠️ Old key format. Delete and regenerate keys in the You tab.');
      return;
    }

    setSending(true);
    setStatus('');
    try {
      const signature        = await signMessage(content, stored.signingPrivateKey);
      const signingPublicKey = getSigningPublicKey();
      const fingerprint      = getPublicKey();
      await broadcastPost({
        id:            crypto.randomUUID(),
        topic,
        sender:        signingPublicKey,
        displaySender: fingerprint,
        content,
        signature,
        timestamp:     Date.now(),
      });
      setContent('');
      setStatus('✅ Transmitted.');
      setTimeout(() => setStatus(''), 2500);
      onPosted?.();
    } catch (e) {
      setStatus('❌ Failed: ' + (e.message || 'unknown error'));
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit();
  };

  return (
    <div className={`postbox${focused ? ' postbox--focused' : ''}${sending ? ' postbox--sending' : ''}`}>
      {/* Room tabs */}
      <div className="postbox-rooms">
        {ROOMS.map(r => (
          <button
            key={r.id}
            className={`postbox-room-tab${topic === r.id ? ' postbox-room-tab--active' : ''}`}
            onClick={() => setTopic(r.id)}
            type="button"
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Compose area */}
      <div className="postbox-compose">
        <div className="postbox-avatar">⚡</div>
        <textarea
          ref={textareaRef}
          className="postbox-textarea"
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Transmit a signal… (Ctrl+Enter to post)"
          rows={4}
          disabled={sending}
          maxLength={MAX_CHARS + 50}
        />
      </div>

      {/* Footer */}
      <div className="postbox-footer">
        <div className="postbox-hints">
          <span className="postbox-hint">🔒 Anonymous · Signed locally</span>
          <span className="postbox-hint">Ctrl+Enter to send</span>
        </div>
        <div className="postbox-footer-right">
          <span className={`postbox-counter${overLimit ? ' postbox-counter--over' : charsLeft < 60 ? ' postbox-counter--warn' : ''}`}>
            {charsLeft}
          </span>
          <button
            className="postbox-submit"
            onClick={handleSubmit}
            disabled={sending || !content.trim() || overLimit}
            type="button"
          >
            {sending ? (
              <><span className="postbox-spinner" /> Transmitting…</>
            ) : (
              <>⚡ Transmit</>
            )}
          </button>
        </div>
      </div>

      {status && (
        <p className={`postbox-status${status.startsWith('✅') ? ' postbox-status--ok' : status.startsWith('❌') ? ' postbox-status--err' : ''}`}>
          {status}
        </p>
      )}
    </div>
  );
}
