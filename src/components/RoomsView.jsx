import React, { useState } from 'react';
import { useConduitSocket } from '../hooks/useConduitSocket.js';
import { PostCard } from './PostCard.jsx';
import PostBox from './PostBox.jsx';

const ALL_ROOMS = [
  { id: 'public',  label: '# general',  desc: 'Open channel. Everyone welcome.',       icon: '🏠' },
  { id: 'crypto',  label: '# crypto',   desc: 'Web3, wallets, on-chain talk.',           icon: '🔷' },
  { id: 'tech',    label: '# tech',     desc: 'Builders, devs, tools, projects.',        icon: '🛠️' },
  { id: 'random',  label: '# random',   desc: 'Anything goes. Keep it interesting.',     icon: '🎲' },
];

export function RoomsView({ onViewProfile }) {
  const { posts } = useConduitSocket();
  const [activeRoom, setActiveRoom] = useState(null);

  if (activeRoom) {
    const room = ALL_ROOMS.find((r) => r.id === activeRoom);
    const filtered = posts.filter((p) => (p.topic || 'public') === activeRoom);
    return (
      <div className="rooms-view">
        <button className="back-btn" onClick={() => setActiveRoom(null)}>
          ← Back to Rooms
        </button>
        <div className="view-title-row">
          <h2 className="view-title">{room?.icon} {room?.label}</h2>
          <p className="view-sub">{room?.desc}</p>
        </div>
        <PostBox />
        <div className="feed">
          {filtered.length === 0 ? (
            <div className="feed-empty">
              <p className="feed-empty-icon">{room?.icon}</p>
              <p className="feed-empty-text">No signals in {room?.label} yet.</p>
              <p className="feed-empty-sub">Be the first to transmit.</p>
            </div>
          ) : (
            filtered.map((p) => (
              <PostCard key={p.id} post={p} onViewProfile={onViewProfile} />
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rooms-view">
      <div className="pulse-header">
        <h2 className="view-title">📡 Rooms</h2>
        <p className="view-sub">Choose your channel</p>
      </div>
      <div className="rooms-grid">
        {ALL_ROOMS.map((room) => {
          const count = posts.filter((p) => (p.topic || 'public') === room.id).length;
          return (
            <div
              key={room.id}
              className="room-card"
              onClick={() => setActiveRoom(room.id)}
            >
              <span className="room-card-icon">{room.icon}</span>
              <div className="room-card-info">
                <p className="room-card-label">{room.label}</p>
                <p className="room-card-desc">{room.desc}</p>
              </div>
              <span className="room-card-count">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
