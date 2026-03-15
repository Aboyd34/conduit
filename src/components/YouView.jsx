import React, { useState } from 'react';
import { useConduitSocket } from '../hooks/useConduitSocket.js';
import { getPublicKey, getSigningPublicKey } from '../ConduitKeyManager.js';
import KeyManager from './KeyManager.jsx';
import { PostCard } from './PostCard.jsx';

export function YouView({ onViewProfile }) {
  const { posts } = useConduitSocket();
  const myPubkey = getPublicKey();
  const myPosts = posts.filter((p) => p.displaySender === myPubkey || p.sender === myPubkey);
  const [showKeys, setShowKeys] = useState(false);

  const totalSignalsReceived = myPosts.reduce((acc, p) => acc + (p.signals || 0), 0);
  const totalRepliesReceived = myPosts.reduce((acc, p) => acc + (p.replies?.length || 0), 0);

  return (
    <div className="you-view">
      <div className="you-header">
        <div className="you-avatar">⚡</div>
        <div>
          <h2 className="view-title you-handle">
            {myPubkey ? myPubkey.slice(0, 12) + '…' : 'Anonymous'}
          </h2>
          <p className="view-sub">Your anonymous node</p>
        </div>
      </div>

      <div className="pulse-stats">
        <div className="stat-card">
          <span className="stat-value">{myPosts.length}</span>
          <span className="stat-label">Posts</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{totalSignalsReceived}</span>
          <span className="stat-label">⚡ Signals</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{totalRepliesReceived}</span>
          <span className="stat-label">Replies</span>
        </div>
      </div>

      <div className="you-actions">
        <button
          className={`you-toggle-btn ${showKeys ? 'you-toggle-btn--active' : ''}`}
          onClick={() => setShowKeys((v) => !v)}
        >
          🔑 {showKeys ? 'Hide Keys' : 'Manage Keys'}
        </button>
      </div>

      {showKeys && (
        <div className="you-keys-section">
          <KeyManager />
        </div>
      )}

      <div className="you-posts-section">
        <h3 className="you-section-title">Your Transmissions</h3>
        {myPosts.length === 0 ? (
          <div className="feed-empty">
            <p className="feed-empty-icon">📡</p>
            <p className="feed-empty-text">You haven't posted yet.</p>
            <p className="feed-empty-sub">Head to Home to transmit your first signal.</p>
          </div>
        ) : (
          <div className="feed">
            {myPosts.map((p) => (
              <PostCard key={p.id} post={p} onViewProfile={onViewProfile} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
