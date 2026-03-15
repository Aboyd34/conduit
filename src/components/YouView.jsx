import React, { useState } from 'react';
import { useConduitSocket } from '../hooks/useConduitSocket.js';
import { getPublicKey } from '../ConduitKeyManager.js';
import KeyManager from './KeyManager.jsx';
import { PostCard } from './PostCard.jsx';
import { AetherPanel } from './AetherPanel.jsx';
import { BackupManager } from './BackupManager.jsx';

export function YouView({ onViewProfile }) {
  const { posts }  = useConduitSocket();
  const myPubkey   = getPublicKey();
  const myPosts    = posts.filter(p => p.displaySender === myPubkey || p.sender === myPubkey);

  const [showKeys,   setShowKeys]   = useState(false);
  const [showBackup, setShowBackup] = useState(false);

  const totalSignals = myPosts.reduce((a, p) => a + (p.signals   || 0), 0);
  const totalReplies = myPosts.reduce((a, p) => a + (p.replies?.length || 0), 0);

  return (
    <div className="you-view">

      {/* Header */}
      <div className="you-header">
        <div className="you-avatar">⚡</div>
        <div>
          <h2 className="view-title you-handle">
            {myPubkey ? myPubkey.slice(0, 12) + '…' : 'Anonymous'}
          </h2>
          <p className="view-sub">Your anonymous node</p>
        </div>
      </div>

      {/* AETH balance + airdrop claim */}
      <AetherPanel />

      {/* Stats */}
      <div className="pulse-stats" style={{ marginTop: '1rem' }}>
        <div className="stat-card">
          <span className="stat-value">{myPosts.length}</span>
          <span className="stat-label">Posts</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{totalSignals}</span>
          <span className="stat-label">⚡ Signals</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{totalReplies}</span>
          <span className="stat-label">Replies</span>
        </div>
      </div>

      {/* Action toggles */}
      <div className="you-actions">
        <button
          className={`you-toggle-btn ${showKeys ? 'you-toggle-btn--active' : ''}`}
          onClick={() => setShowKeys(v => !v)}
        >
          🔑 {showKeys ? 'Hide Keys' : 'Manage Keys'}
        </button>
        <button
          className={`you-toggle-btn ${showBackup ? 'you-toggle-btn--active' : ''}`}
          onClick={() => setShowBackup(v => !v)}
        >
          📦 {showBackup ? 'Hide Backup' : 'Backup & Restore'}
        </button>
      </div>

      {showKeys   && <div className="you-keys-section"><KeyManager /></div>}
      {showBackup && <div className="you-backup-section"><BackupManager /></div>}

      {/* Posts */}
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
            {myPosts.map(p => (
              <PostCard key={p.id} post={p} onViewProfile={onViewProfile} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
