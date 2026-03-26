import React, { useState, useMemo } from 'react'
import { getProfile } from './UserProfile.jsx'

const ROOM_COLORS = { general:'#5b8cff', dev:'#9b5cff', privacy:'#00ffc3', aether:'#ffd700', random:'#ff6b6b' }
const ROOMS = ['general','dev','privacy','aether','random']

export default function ProfileCard({ fingerprint, posts = {}, onClose, onDM }) {
  const profile = getProfile(fingerprint) || {}
  const handle  = profile.handle || fingerprint?.slice(0,10) + '…'
  const bio     = profile.bio || ''

  const myPosts = useMemo(() => {
    return ROOMS.flatMap(room =>
      (posts[room] || []).filter(p => p.fingerprint === fingerprint && !p.removed)
        .map(p => ({ ...p, room }))
    ).sort((a,b) => (b.ts || 0) - (a.ts || 0)).slice(0, 10)
  }, [posts, fingerprint])

  const totalReactions = useMemo(() => {
    return myPosts.reduce((sum, p) => sum + Object.values(p.reactions || {}).reduce((a,b)=>a+b,0), 0)
  }, [myPosts])

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 700 }} />

      {/* Slide-up card */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#0a0916', borderTop: '1px solid #2d2a4a',
        borderRadius: '20px 20px 0 0', padding: '24px 20px 40px',
        zIndex: 701, maxHeight: '80vh', overflowY: 'auto',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.7)',
        animation: 'slideUp 0.25s ease',
      }}>
        {/* Drag handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.1)', margin: '0 auto 20px' }} />

        {/* Avatar + Identity */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 18 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
            {handle[0]?.toUpperCase() || '?'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 17, fontWeight: 800, color: '#e2e8f0' }}>{handle}</div>
            {bio && <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '4px 0 0', lineHeight: 1.5 }}>{bio}</p>}
            <div style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.18)', marginTop: 5, wordBreak: 'break-all' }}>{fingerprint}</div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {[['Signals', myPosts.length], ['Reactions', totalReactions]].map(([l,v]) => (
            <div key={l} style={{ flex: 1, background: '#0f0e1a', border: '1px solid #2d2a4a', borderRadius: 10, padding: '10px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 700, color: '#a78bfa' }}>{v}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 3 }}>{l}</div>
            </div>
          ))}
          <button onClick={() => onDM && onDM(fingerprint)} style={{ flex: 1, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 10, padding: '10px', textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ fontSize: 18 }}>✉️</div>
            <div style={{ fontSize: 10, color: '#a78bfa', marginTop: 3, fontFamily: 'monospace' }}>DM</div>
          </button>
        </div>

        {/* Recent posts */}
        {myPosts.length > 0 && (
          <>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', letterSpacing: 2, marginBottom: 10 }}>RECENT SIGNALS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {myPosts.slice(0,5).map(p => (
                <div key={p.id} style={{ background: '#0f0e1a', border: `1px solid ${ROOM_COLORS[p.room] || '#2d2a4a'}22`, borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ fontSize: 10, color: ROOM_COLORS[p.room] || '#a78bfa', fontFamily: 'monospace', marginBottom: 4 }}>#{p.room}</div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.5 }}>{p.text}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <style>{`@keyframes slideUp { from { transform: translateY(60px); opacity:0 } to { transform: translateY(0); opacity:1 } }`}</style>
    </>
  )
}
