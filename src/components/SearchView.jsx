import React, { useState, useMemo } from 'react'

const ROOMS = ['general','dev','privacy','aether','random']
const ROOM_COLORS = { general:'#5b8cff', dev:'#9b5cff', privacy:'#00ffc3', aether:'#ffd700', random:'#ff6b6b' }

export default function SearchView({ posts = {}, onGoToRoom }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all') // all | posts | rooms | fingerprints

  const flatPosts = useMemo(() => {
    return ROOMS.flatMap(room =>
      (posts[room] || []).filter(p => !p.removed).map(p => ({ ...p, room }))
    )
  }, [posts])

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return flatPosts.filter(p => {
      if (filter === 'rooms')        return p.room.includes(q)
      if (filter === 'fingerprints') return p.fingerprint?.toLowerCase().includes(q)
      if (filter === 'posts')        return p.text?.toLowerCase().includes(q)
      return (
        p.text?.toLowerCase().includes(q) ||
        p.fingerprint?.toLowerCase().includes(q) ||
        p.room.includes(q)
      )
    })
  }, [query, filter, flatPosts])

  const trending = useMemo(() => {
    const words = {}
    flatPosts.forEach(p => {
      ;(p.text || '').split(/\s+/).forEach(w => {
        if (w.startsWith('#') && w.length > 1) words[w] = (words[w] || 0) + 1
      })
    })
    return Object.entries(words).sort((a,b) => b[1]-a[1]).slice(0, 8)
  }, [flatPosts])

  function highlight(text, q) {
    if (!text || !q) return text
    const idx = text.toLowerCase().indexOf(q.toLowerCase())
    if (idx === -1) return text
    return (
      <>{text.slice(0, idx)}<mark style={{ background: 'rgba(124,58,237,0.35)', color: '#e2e8f0', borderRadius: 2 }}>{text.slice(idx, idx+q.length)}</mark>{text.slice(idx+q.length)}</>
    )
  }

  return (
    <div style={{ padding: '20px 16px', maxWidth: 580, margin: '0 auto', paddingBottom: 80 }}>

      {/* Search bar */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none' }}>🔍</span>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search signals, rooms, fingerprints…"
          autoFocus
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '12px 14px 12px 38px',
            background: '#0f0e1a', border: '1px solid #2d2a4a',
            borderRadius: 12, color: '#e2e8f0', fontSize: 14,
            outline: 'none', fontFamily: 'monospace',
          }}
        />
        {query && (
          <button onClick={() => setQuery('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 16 }}>×</button>
        )}
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all','posts','rooms','fingerprints'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '5px 14px', borderRadius: 20, border: '1px solid',
            borderColor: filter === f ? '#7c3aed' : 'rgba(255,255,255,0.1)',
            background: filter === f ? 'rgba(124,58,237,0.15)' : 'transparent',
            color: filter === f ? '#a78bfa' : 'rgba(255,255,255,0.35)',
            fontSize: 11, cursor: 'pointer', fontFamily: 'monospace',
          }}>{f}</button>
        ))}
      </div>

      {/* Trending hashtags */}
      {!query && trending.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', letterSpacing: 2, marginBottom: 10 }}>TRENDING</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {trending.map(([tag, count]) => (
              <button key={tag} onClick={() => setQuery(tag)} style={{
                padding: '5px 12px', borderRadius: 20,
                background: 'rgba(124,58,237,0.08)',
                border: '1px solid rgba(124,58,237,0.2)',
                color: '#a78bfa', fontSize: 12, cursor: 'pointer',
                fontFamily: 'monospace',
              }}>{tag} <span style={{ opacity: 0.4 }}>{count}</span></button>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!query && (
        <div style={{ textAlign: 'center', opacity: 0.3, marginTop: 40 }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📡</div>
          <p style={{ fontFamily: 'monospace', fontSize: 13 }}>Search the signal.</p>
        </div>
      )}

      {/* No results */}
      {query && results.length === 0 && (
        <div style={{ textAlign: 'center', opacity: 0.3, marginTop: 40 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🔇</div>
          <p style={{ fontFamily: 'monospace', fontSize: 12 }}>No signals match "{query}"</p>
        </div>
      )}

      {/* Results */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {results.map(post => (
          <div key={post.id + post.room}
            onClick={() => onGoToRoom && onGoToRoom(post.room)}
            style={{
              background: '#0f0e1a', border: `1px solid ${ROOM_COLORS[post.room]}30`,
              borderRadius: 12, padding: '14px 16px', cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = ROOM_COLORS[post.room]}
            onMouseLeave={e => e.currentTarget.style.borderColor = `${ROOM_COLORS[post.room]}30`}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontFamily: 'monospace', fontSize: 10, color: ROOM_COLORS[post.room] }}>#{post.room}</span>
              <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>{post.fingerprint}</span>
            </div>
            <p style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.6, margin: 0 }}>{highlight(post.text, query)}</p>
          </div>
        ))}
      </div>

    </div>
  )
}
