import React, { useEffect, useRef } from 'react';
import { useConduitSocket } from '../hooks/useConduitSocket.js';
import { RoomSelector } from './RoomSelector.jsx';
import { PostCard } from './PostCard.jsx';

export default function Feed({ onViewProfile, activeRoom, onRoomChange, onNotification }) {
  const { posts, connected, hasMore, loadMore } = useConduitSocket(onNotification);
  const loaderRef = useRef(null);

  const filtered = activeRoom === 'public'
    ? posts
    : posts.filter((p) => p.topic === activeRoom);

  // Infinite scroll — IntersectionObserver watches a sentinel div at the bottom
  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && hasMore) loadMore(); },
      { threshold: 0.1 }
    );
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return (
    <div className="feed-container">
      <div className="feed-header">
        <span className={`conn-dot ${connected ? 'online' : 'offline'}`} />
        <span className="conn-label">{connected ? 'Live' : 'Reconnecting...'}</span>
        <span className="feed-count">{filtered.length} signal{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      <RoomSelector activeRoom={activeRoom} onRoomChange={onRoomChange} />

      {!filtered.length ? (
        <div className="feed-empty">
          <p className="feed-empty-icon">📡</p>
          <p className="feed-empty-text">No signals in this room yet.</p>
          <p className="feed-empty-sub">Be the first to transmit.</p>
        </div>
      ) : (
        <div className="feed">
          {filtered.map((post) => (
            <PostCard key={post.id} post={post} onViewProfile={onViewProfile} />
          ))}
          {/* Infinite scroll sentinel */}
          <div ref={loaderRef} className="scroll-sentinel">
            {hasMore && <p className="scroll-loading">⚡ Loading more signals...</p>}
          </div>
        </div>
      )}
    </div>
  );
}
