import React, { useState } from 'react';
import { SenderName } from './SenderName.jsx';
import { sendReply, sendSignal, sendAmplify } from '../api/interactions.js';
import { getPublicKey } from '../ConduitKeyManager.js';
import { RecycleButton } from './AetherPanel.jsx';

export function PostCard({ post, onViewProfile }) {
  const [showReply, setShowReply]     = useState(false);
  const [replyText, setReplyText]     = useState('');
  const [replySending, setReplySending] = useState(false);
  const [signaled, setSignaled]       = useState(false);
  const [amplified, setAmplified]     = useState(false);
  const [localError, setLocalError]   = useState(null);

  const displayKey   = post.displaySender || post.sender;
  const replyCount   = post.replies?.length || 0;
  const signalCount  = post.signals  || 0;
  const amplifyCount = post.amplifies || 0;

  async function handleSignal() {
    if (signaled) return;
    setSignaled(true);
    try { await sendSignal(post.id, getPublicKey()); }
    catch {
      setSignaled(false);
      setLocalError('Signal failed');
      setTimeout(() => setLocalError(null), 2000);
    }
  }

  async function handleAmplify() {
    if (amplified) return;
    setAmplified(true);
    try { await sendAmplify(post.id, getPublicKey()); }
    catch {
      setAmplified(false);
      setLocalError('Amplify failed');
      setTimeout(() => setLocalError(null), 2000);
    }
  }

  async function submitReply() {
    if (!replyText.trim() || replySending) return;
    setReplySending(true);
    try {
      await sendReply(post.id, replyText.trim(), getPublicKey());
      setReplyText('');
      setShowReply(false);
    } catch {
      setLocalError('Reply failed — try again');
      setTimeout(() => setLocalError(null), 2500);
    } finally { setReplySending(false); }
  }

  return (
    <div className="post-card">
      <div className="post-card-header">
        <p
          className="post-sender post-sender--clickable"
          onClick={() => onViewProfile?.(post.sender)}
          title="View profile"
        >
          <SenderName senderPubkey={post.sender} displayKey={displayKey} />
        </p>
        <span className="post-time">{new Date(post.timestamp).toLocaleTimeString()}</span>
      </div>

      <p className="post-content">{post.content}</p>

      {localError && <p className="post-error">{localError}</p>}

      <div className="post-actions">
        <button
          className={`action-btn ${showReply ? 'action-btn--active' : ''}`}
          onClick={() => setShowReply(v => !v)}
        >
          <span className="action-icon">💬</span>
          <span className="action-label">Reply</span>
          {replyCount > 0 && <span className="action-count">{replyCount}</span>}
        </button>

        <button
          className={`action-btn ${amplified ? 'action-btn--amplified' : ''}`}
          onClick={handleAmplify}
          disabled={amplified}
        >
          <span className="action-icon">🔁</span>
          <span className="action-label">Amplify</span>
          {amplifyCount > 0 && <span className="action-count">{amplifyCount}</span>}
        </button>

        <button
          className={`action-btn ${signaled ? 'action-btn--signaled' : ''}`}
          onClick={handleSignal}
          disabled={signaled}
        >
          <span className="action-icon">⚡</span>
          <span className="action-label">Signal</span>
          {signalCount > 0 && <span className="action-count">{signalCount}</span>}
        </button>

        {/* Recycle — only renders if wallet connected + contract live */}
        <RecycleButton postId={post.id} />
      </div>

      {showReply && (
        <div className="reply-box">
          <textarea
            className="reply-input"
            placeholder="Add to the signal… (Ctrl+Enter to send)"
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.metaKey || e.ctrlKey) && submitReply()}
            rows={2}
            autoFocus
          />
          <div className="reply-actions">
            <button className="reply-submit-btn" onClick={submitReply} disabled={replySending}>
              {replySending ? 'Sending…' : 'Send'}
            </button>
            <button className="reply-cancel-btn" onClick={() => { setShowReply(false); setReplyText(''); }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {post.replies?.length > 0 && (
        <div className="replies-list">
          {post.replies.map(r => (
            <div key={r.id} className="reply-item">
              <span className="reply-sender">{r.sender ? r.sender.slice(0,8)+'…' : 'anon'}</span>
              <span className="reply-text">{r.content}</span>
              <span className="reply-time">{new Date(r.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
