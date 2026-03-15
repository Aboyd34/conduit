import React from 'react';
import { useAether } from '../hooks/useAether.js';
import { PostCard } from './PostCard.jsx';
import PostBox from './PostBox.jsx';

/**
 * AetherRoom — token-gated channel
 * Requires wallet connected + >= 100 AETH to enter
 */
export function AetherRoom({ posts, onViewProfile }) {
  const { isConnected, isGated, balance, contractReady } = useAether();

  const roomPosts = posts.filter((p) => (p.topic || '') === 'aether');

  if (!isConnected) {
    return (
      <div className="gate-wall">
        <div className="gate-wall-inner">
          <p className="gate-icon">⚡</p>
          <h3 className="gate-title"># aether</h3>
          <p className="gate-desc">This channel is for Aether holders.</p>
          <p className="gate-sub">Connect your wallet to check access.</p>
        </div>
      </div>
    );
  }

  if (!contractReady) {
    return (
      <div className="gate-wall">
        <div className="gate-wall-inner">
          <p className="gate-icon">⚡</p>
          <h3 className="gate-title"># aether</h3>
          <p className="gate-desc">Token-gated access — contract launching soon.</p>
          <p className="gate-sub">Claim your airdrop to be ready on day one.</p>
        </div>
      </div>
    );
  }

  if (!isGated) {
    return (
      <div className="gate-wall">
        <div className="gate-wall-inner">
          <p className="gate-icon">🔒</p>
          <h3 className="gate-title"># aether</h3>
          <p className="gate-desc">You need <strong>100 AETH</strong> to enter this channel.</p>
          <p className="gate-sub">Your balance: {parseFloat(balance).toLocaleString()} AETH</p>
          <p className="gate-hint">Claim your airdrop or earn AETH by posting and getting signals.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="aether-room">
      <div className="aether-room-header">
        <h2 className="view-title">⚡ # aether</h2>
        <p className="view-sub">Holders-only channel · {parseFloat(balance).toLocaleString()} AETH</p>
      </div>
      <PostBox />
      <div className="feed">
        {roomPosts.length === 0 ? (
          <div className="feed-empty">
            <p className="feed-empty-icon">⚡</p>
            <p className="feed-empty-text">No signals yet in #aether</p>
            <p className="feed-empty-sub">Be the first holder to transmit.</p>
          </div>
        ) : (
          roomPosts.map((p) => (
            <PostCard key={p.id} post={p} onViewProfile={onViewProfile} />
          ))
        )}
      </div>
    </div>
  );
}
