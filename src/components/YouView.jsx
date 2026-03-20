import { useState, useEffect } from 'react'
import { useConduitSocket } from '../hooks/useConduitSocket.js'

export default function YouView({ profileId, onBack }) {
  const { posts } = useConduitSocket()
  const [alias, setAlias] = useState(() => localStorage.getItem('conduit_alias') || '')
  const [saved, setSaved] = useState(false)

  const myPosts = posts.filter(p =>
    profileId ? p.sender === profileId : p.sender === alias
  ).slice().reverse().slice(0, 30)

  function saveAlias() {
    localStorage.setItem('conduit_alias', alias)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: 680, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {onBack && (
          <button type="button" onClick={onBack}
            style={{ background: 'transparent', border: '1px solid #1e1e2e', borderRadius: 8, color: '#52525b', padding: '0.3rem 0.7rem', cursor: 'pointer', fontSize: '0.8rem' }}
          >← Back</button>
        )}
        <h2 style={{ color: '#f0f0f0', fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.4rem', fontWeight: 700 }}>
          {profileId ? `👤 Profile` : '👤 You'}
        </h2>
      </div>

      {/* Identity card */}
      {!profileId && (
        <div style={{
          background: 'rgba(122,92,255,0.06)', border: '1px solid rgba(122,92,255,0.2)',
          borderRadius: 14, padding: '1.25rem', marginBottom: '1.5rem'
        }}>
          <p style={{ color: '#71717a', fontSize: '0.75rem', marginBottom: '0.5rem', fontFamily: 'Space Grotesk' }}>YOUR ALIAS</p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={alias}
              onChange={e => setAlias(e.target.value)}
              placeholder="Set anonymous alias..."
              style={{
                flex: 1, padding: '0.6rem 0.85rem',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid #1e1e2e', borderRadius: 8,
                color: '#f0f0f0', fontSize: '0.875rem',
                fontFamily: 'Space Grotesk, sans-serif', outline: 'none'
              }}
            />
            <button type="button" onClick={saveAlias}
              style={{
                padding: '0.6rem 1rem', borderRadius: 8,
                background: saved ? '#00ff9f22' : 'rgba(122,92,255,0.2)',
                border: saved ? '1px solid #00ff9f' : '1px solid rgba(122,92,255,0.4)',
                color: saved ? '#00ff9f' : '#7a5cff',
                fontSize: '0.8rem', cursor: 'pointer',
                fontFamily: 'Space Grotesk', fontWeight: 600
              }}
            >{saved ? '✓ Saved' : 'Save'}</button>
          </div>
          <p style={{ color: '#3f3f5a', fontSize: '0.7rem', marginTop: '0.5rem' }}>Alias stored locally only. Never sent to any server.</p>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[{ label: 'Signals', val: myPosts.length }, { label: 'Rooms', val: [...new Set(myPosts.map(p => p.topic || 'public'))].length }].map(s => (
          <div key={s.label} style={{
            flex: 1, background: 'rgba(255,255,255,0.03)',
            border: '1px solid #1e1e2e', borderRadius: 12,
            padding: '1rem', textAlign: 'center'
          }}>
            <p style={{ color: '#7a5cff', fontSize: '1.5rem', fontWeight: 700, fontFamily: 'Space Grotesk' }}>{s.val}</p>
            <p style={{ color: '#52525b', fontSize: '0.75rem' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Post history */}
      <h3 style={{ color: '#71717a', fontSize: '0.75rem', fontFamily: 'Space Grotesk', marginBottom: '0.75rem', letterSpacing: '0.08em' }}>RECENT SIGNALS</h3>
      {myPosts.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#3f3f5a', marginTop: '2rem' }}>
          <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👤</p>
          <p>No signals found for this identity.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {myPosts.map(p => (
            <div key={p.id} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid #1e1e2e', borderRadius: 10,
              padding: '0.75rem 1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ color: '#7a5cff', fontSize: '0.7rem', fontWeight: 700, fontFamily: 'Space Grotesk' }}>#{p.topic || 'public'}</span>
                <span style={{ color: '#3f3f5a', fontSize: '0.7rem' }}>{p.ts ? new Date(p.ts).toLocaleTimeString() : ''}</span>
              </div>
              <p style={{ color: '#d4d4d8', fontSize: '0.875rem', lineHeight: 1.5, margin: 0 }}>{p.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
