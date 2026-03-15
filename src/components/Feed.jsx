import React, { useState } from 'react';
import { useConduitSocket } from '../hooks/useConduitSocket.js';
import { ProfilePage } from './ProfilePage.jsx';
import { RoomSelector } from './RoomSelector.jsx';
import { PostCard } from './PostCard.jsx';

export default function Feed() {
  const { posts, connected } = useConduitSocket();
  const [activeRoom, setActiveRoom] = useState('public');
  const [viewingProfile, setViewingProfile] = useState(null);

  const filtered = activeRoom === 'public'
    ? posts
    : posts.filter((p) => p.topic === activeRoom);

  return (
    <div className="feed-container">
      <div className="feed-header">
        <span className={`conn-dot ${connected ? 'online' : 'offline'}`} />
        <span className="conn-label">{connected ? 'Live' : 'Reconnecting...'}</span>
        <span className="feed-count">{filtered.length} signal{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      <RoomSelector activeRoom={activeRoom} onRoomChange={setActiveRoom} />

      {!filtered.length ? (
        <div className="feed-empty">
          <p className="feed-empty-icon">📡</p>
          <p className="feed-empty-text">No signals in this room yet.</p>
          <p className="feed-empty-sub">Be the first to transmit.</p>
        </div>
      ) : (
        <div className="feed">
          {filtered.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onViewProfile={setViewingProfile}
            />
          ))}
        </div>
      )}

      {viewingProfile && (
        <ProfilePage
          pubkey={viewingProfile}
          onClose={() => setViewingProfile(null)}
        />
      )}
    </div>
  );
}
