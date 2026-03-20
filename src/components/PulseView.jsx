import { useState, useEffect } from 'react'
import { useConduitSocket } from '../hooks/useConduitSocket.js'

export default function PulseView() {
  const { posts, connected } = useConduitSocket()
  const [filter, setFilter] = useState('all')

  const topics = ['all', 'public', 'crypto', 'dev', 'aether', 'lounge']

  const filtered = filter === 'all'
    ? [...posts].reverse().slice(0, 50)
    : [...posts].filter(p => (p.topic || 'public') === filter).reverse().slice(0, 50)

  return (
    <div style={{ padding: '1.5rem', maxWidth: 720, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <h2 style={{ color: '#f0f0f0', fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.4rem', fontWeight: 700 }}>📡 Pulse</h2>
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: connected ? '#00ff9f' : '#ef4444',
          boxShadow: connected ? '0 0 8px #00ff9f' : 'none',
          display: 'inline-block'
        }} />
        <span style={{ color: '#52525b', fontSize: '0.75rem' }}>{connected ? 'Live' : 'Offline'}</span>
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        {topics.map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setFilter(t)}
            style={{
              padding: '0.3rem 0.85rem',
              borderRadius: 999,
              border: filter === t ? '1px solid #7a5cff' : '1px solid #1e1e2e',
              background: filter === t ? 'rgba(122,92,255,0.15)' : 'transparent',
              color: filter === t ? '#7a5cff' : '#52525b',
              fontSize: '0.75rem',
              cursor: 'pointer',
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 600,
              textTransform: 'capitalize'
            }}
          >{t}</button>
        ))}
      </div>

      {/* Feed */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#3f3f5a', marginTop: '4rem' }}>
          <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📡</p>
          <p>No signals yet. Be the first to transmit.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map(p => (
            <div key={p.id} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid #1e1e2e',
              borderRadius: 12,
              padding: '0.85rem 1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: '#7a5cff', fontSize: '0.75rem', fontWeight: 700, fontFamily: 'Space Grotesk' }}>
                  #{p.topic || 'public'}
                </span>
                <span style={{ color: '#3f3f5a', fontSize: '0.7rem' }}>
                  {p.ts ? new Date(p.ts).toLocaleTimeString() : ''}
                </span>
              </div>
              <p style={{ color: '#d4d4d8', fontSize: '0.9rem', lineHeight: 1.55, margin: 0 }}>{p.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
