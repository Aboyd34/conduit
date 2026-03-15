import React, { useState } from 'react';
import { useConduitSocket } from '../hooks/useConduitSocket.js';
import { SenderName } from './SenderName.jsx';
import { ProfilePage } from './ProfilePage.jsx';
import { RoomSelector } from './RoomSelector.jsx';

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
      </div>

      <RoomSelector activeRoom={activeRoom} onRoomChange={setActiveRoom} />

      {!filtered.length ? (
        <p className="text-muted">No posts in this room yet. Be the first.</p>
      ) : (
        <div className="feed">
          {filtered.map((post) => (
            <div key={post.id} className="post-card">
              <p
                className="post-sender post-sender--clickable"
                onClick={() => setViewingProfile(post.sender)}
                title="View profile"
              >
                <SenderName senderPubkey={post.sender} />
              </p>
              <p className="post-content">{post.content}</p>
              <p className="post-time">{new Date(post.timestamp).toLocaleString()}</p>
            </div>
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
