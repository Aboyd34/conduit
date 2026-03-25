import React, { useState } from 'react';
import { useConduitSocket } from '../hooks/useConduitSocket.js';
import { PostCard } from './PostCard.jsx';

const topics = ['all', 'public', 'crypto', 'tech', 'random', 'aether'];

export default function PulseView() {
  const { posts, connected } = useConduitSocket();
  const [filter, setFilter] = useState('all');

  const filtered = (filter === 'all'
    ? [...posts]
    : posts.filter(p => (p.topic || 'public') === filter)
  ).reverse().slice(0, 60);

  return (
    <div style={{
      padding: '24px 28px',
      maxWidth: 740,
      margin: '0 auto',
      fontFamily: "'Space Grotesk', 'Inter', sans-serif",
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <h2 style={{
          color: 'rgba(255,255,255,0.88)',
          fontSize: '1.05rem',
          fontWeight: 700,
          margin: 0,
          letterSpacing: '-0.01em',
        }}>Pulse</h2>
        <span style={{
          width: 7, height: 7, borderRadius: '50%',
          background: connected ? '#00ff9f' : '#ef4444',
          boxShadow: connected ? '0 0 6px #00ff9f88' : 'none',
          display: 'inline-block',
          flexShrink: 0,
        }} />
        <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.72rem' }}>
          {connected ? 'Live' : 'Offline'}
        </span>
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        {topics.map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setFilter(t)}
            style={{
              padding: '4px 12px',
              borderRadius: 20,
              border: filter === t
                ? '1px solid rgba(122,92,255,0.5)'
                : '1px solid rgba(255,255,255,0.07)',
              background: filter === t ? 'rgba(122,92,255,0.14)' : 'transparent',
              color: filter === t ? '#b8a3ff' : 'rgba(255,255,255,0.3)',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              textTransform: 'capitalize',
              transition: 'all 0.12s',
            }}
          >{t}</button>
        ))}
      </div>

      {/* Feed */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center',
          color: 'rgba(255,255,255,0.18)',
          marginTop: 80,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          <p style={{ fontSize: '0.85rem', margin: 0 }}>No signals yet.</p>
          <p style={{ fontSize: '0.72rem', margin: 0, opacity: 0.6 }}>Be the first to transmit.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filtered.map(p => <PostCard key={p.id} post={p} />)}
        </div>
      )}
    </div>
  );
}
