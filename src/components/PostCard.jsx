import React, { useState } from 'react';
import { SenderName } from './SenderName.jsx';

export function PostCard({ post, onViewProfile }) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState([]);
  const [signals, setSignals] = useState(0);
  const [amplified, setAmplified] = useState(false);
  const [signaled, setSignaled] = useState(false);

  const displayKey = post.displaySender || post.sender;

  function handleSignal() {
    if (!signaled) {
      setSignals((s) => s + 1);
      setSignaled(true);
    }
  }

  function handleAmplify() {
    setAmplified((a) => !a);
  }

  function submitReply() {
    if (!replyText.trim()) return;
    setReplies((r) => [
      ...r,
      { id: Date.now(), text: replyText.trim(), time: new Date().toLocaleTimeString() },
    ]);
    setReplyText('');
    setShowReply(false);
  }

  return (
    <div className="post-card">
      <div className="post-card-header">
        <p
          className="post-sender post-sender--clickable"
          onClick={() => onViewProfile && onViewProfile(post.sender)}
          title="View profile"
        >
          <SenderName senderPubkey={post.sender} displayKey={displayKey} />
        </p>
        <span className="post-time">{new Date(post.timestamp).toLocaleTimeString()}</span>
      </div>

      <p className="post-content">{post.content}</p>

      <div className="post-actions">
        <button
          className={`action-btn ${showReply ? 'action-btn--active' : ''}`}
          onClick={() => setShowReply((v) => !v)}
          title="Reply"
        >
          <span className="action-icon">💬</span>
          <span className="action-label">Reply</span>
          {replies.length > 0 && <span className="action-count">{replies.length}</span>}
        </button>

        <button
          className={`action-btn ${amplified ? 'action-btn--amplified' : ''}`}
          onClick={handleAmplify}
          title="Amplify"
        >
          <span className="action-icon">🔁</span>
          <span className="action-label">Amplify</span>
        </button>

        <button
          className={`action-btn ${signaled ? 'action-btn--signaled' : ''}`}
          onClick={handleSignal}
          title="Signal"
        >
          <span className="action-icon">⚡</span>
          <span className="action-label">Signal</span>
          {signals > 0 && <span className="action-count">{signals}</span>}
        </button>
      </div>

      {showReply && (
        <div className="reply-box">
          <textarea
            className="reply-input"
            placeholder="Add to the signal..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={2}
          />
          <div className="reply-actions">
            <button className="reply-submit-btn" onClick={submitReply}>Send</button>
            <button className="reply-cancel-btn" onClick={() => setShowReply(false)}>Cancel</button>
          </div>
        </div>
      )}

      {replies.length > 0 && (
        <div className="replies-list">
          {replies.map((r) => (
            <div key={r.id} className="reply-item">
              <span className="reply-you">You</span>
              <span className="reply-text">{r.text}</span>
              <span className="reply-time">{r.time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
