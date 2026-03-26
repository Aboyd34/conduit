import React, { useState, useMemo } from 'react'
import ReactionsBar from './ReactionsBar.jsx'

const ROOMS = ['general','dev','privacy','aether','random']
const ROOM_COLORS = { general:'#5b8cff', dev:'#9b5cff', privacy:'#00ffc3', aether:'#ffd700', random:'#ff6b6b' }
const ROOM_LABELS = { general:'#general', dev:'#dev', privacy:'#privacy', aether:'#aether', random:'#random' }

function signalScore(post) {
  const reactions = Object.values(post.reactions || {}).reduce((a,b) => a+b, 0)
  const age = (Date.now() - (post.ts || 0)) / 1000 / 60 // minutes
  return reactions * 10 - age * 0.5
}

export default function PulseView({ posts = {}, onGoToRoom, onViewProfile, onOpenThread, onReact }) {
  const [filter, setFilter] = useState('all')
  const [sort, setSort]     = useState('hot') // hot | new

  const flat = useMemo(() => {
    return ROOMS.flatMap(room =>
      (posts[room] || []).filter(p => !p.removed).map(p => ({ ...p, room }))
    )
  }, [posts])

  const filtered = useMemo(() => {
    const base = filter === 'all' ? flat : flat.filter(p => p.room === filter)
    if (sort === 'hot') return [...base].sort((a,b) => signalScore(b) - signalScore(a))
    return [...base].sort((a,b) => (b.ts || 0) - (a.ts || 0))
  }, [flat, filter, sort])

  const topPost = filtered[0]

  return (
    <div style={{ padding: '16px 14px', maxWidth: 580, margin: '0 auto', paddingBottom: 80 }}>

      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 900, color: '#e2e8f0', margin: '0 0 4px', letterSpacing: 2 }}>PULSE</h1>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', margin: 0, fontFamily: 'monospace' }}>Top signals across all rooms, ranked by energy.</p>
      </div>

      {/* Sort + Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['hot','new'].map(s => (
          <button key={s} onClick={() => setSort(s)} style={{
            padding: '5px 14px', borderRadius: 20, border: '1px solid',
            borderColor: sort === s ? '#7c3aed' : 'rgba(255,255,255,0.1)',
            background: sort === s ? 'rgba(124,58,237,0.15)' : 'transparent',
            color: sort === s ? '#a78bfa' : 'rgba(255,255,255,0.35)',
            fontSize: 11, cursor: 'pointer', fontFamily: 'monospace',
          }}>{s === 'hot' ? '🔥 Hot' : '🆕 New'}</button>
        ))}
        <div style={{ width: 1, background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
        {['all', ...ROOMS].map(r => (
          <button key={r} onClick={() => setFilter(r)} style={{
            padding: '5px 12px', borderRadius: 20, border: '1px solid',
            borderColor: filter === r ? (ROOM_COLORS[r] || '#7c3aed') : 'rgba(255,255,255,0.08)',
            background: filter === r ? `${ROOM_COLORS[r] || '#7c3aed'}15` : 'transparent',
            color: filter === r ? (ROOM_COLORS[r] || '#a78bfa') : 'rgba(255,255,255,0.3)',
            fontSize: 11, cursor: 'pointer', fontFamily: 'monospace',
          }}>{r === 'all' ? 'All' : ROOM_LABELS[r]}</button>
        ))}
      </div>

      {/* Top signal hero */}
      {topPost && sort === 'hot' && (
        <div style={{
          background: `linear-gradient(135deg, ${ROOM_COLORS[topPost.room]}15, rgba(255,255,255,0.02))`,
          border: `1px solid ${ROOM_COLORS[topPost.room]}40`,
          borderRadius: 16, padding: '18px 18px', marginBottom: 16, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 10, right: 14, fontFamily: 'monospace', fontSize: 10, color: ROOM_COLORS[topPost.room], opacity: 0.6, letterSpacing: 2 }}>TOP SIGNAL</div>
          <div style={{ fontFamily: 'monospace', fontSize: 10, color: ROOM_COLORS[topPost.room], marginBottom: 8 }}>{ROOM_LABELS[topPost.room]} · {topPost.fingerprint}</div>
          <p style={{ fontSize: 15, color: '#e2e8f0', lineHeight: 1.65, margin: '0 0 12px', fontWeight: 500 }}>{topPost.text}</p>
          <ReactionsBar reactions={topPost.reactions} onReact={e => onReact && onReact(topPost.room, topPost.id, e)} color={ROOM_COLORS[topPost.room]} />
        </div>
      )}

      {/* Feed */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', opacity: 0.3, marginTop: 40 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📡</div>
          <p style={{ fontFamily: 'monospace', fontSize: 12 }}>No signals yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.slice(topPost && sort === 'hot' ? 1 : 0).map(post => {
            const color = ROOM_COLORS[post.room] || '#7c3aed'
            const reactionTotal = Object.values(post.reactions || {}).reduce((a,b)=>a+b,0)
            return (
              <div key={post.id + post.room} style={{
                background: 'rgba(255,255,255,0.02)', border: `1px solid ${color}20`,
                borderRadius: 12, padding: '13px 14px', transition: 'border-color 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = `${color}55`}
                onMouseLeave={e => e.currentTarget.style.borderColor = `${color}20`}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <button onClick={() => onViewProfile && onViewProfile(post.fingerprint)}
                    style={{ fontFamily: 'monospace', fontSize: 10, color: `${color}90`, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    {ROOM_LABELS[post.room]} · {post.fingerprint}
                  </button>
                  {reactionTotal > 0 && (
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace' }}>⚡ {reactionTotal}</span>
                  )}
                </div>
                <p style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.6, margin: '0 0 10px' }}>{post.text}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <ReactionsBar reactions={post.reactions} onReact={e => onReact && onReact(post.room, post.id, e)} color={color} />
                  <button onClick={() => onOpenThread && onOpenThread(post, post.room)}
                    style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'monospace' }}>
                    Thread →
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
