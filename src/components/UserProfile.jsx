import React, { useState, useEffect } from 'react'

// ─── Profile Storage
const PROFILE_KEY = 'conduit_profiles'

export function saveProfile(fingerprint, data) {
  const all = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}')
  all[fingerprint] = { ...all[fingerprint], ...data, updatedAt: Date.now() }
  localStorage.setItem(PROFILE_KEY, JSON.stringify(all))
}

export function getProfile(fingerprint) {
  const all = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}')
  return all[fingerprint] || null
}

// ─── Avatar generator (deterministic from fingerprint)
const AVATAR_COLORS = ['#7c3aed','#5b8cff','#00ffc3','#ff6b6b','#ffd700','#9b5cff','#ff8c42','#00d4ff']
function avatarColor(fp) {
  let h = 0; for (const c of fp) h = (h << 5) - h + c.charCodeAt(0)
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}
function avatarInitial(handle) { return (handle || '?')[0].toUpperCase() }

export function Avatar({ fingerprint, handle, size = 40 }) {
  const color = avatarColor(fingerprint || '')
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `${color}22`, border: `2px solid ${color}55`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'monospace', fontWeight: 700,
      fontSize: size * 0.38, color, flexShrink: 0,
    }}>
      {avatarInitial(handle || fingerprint)}
    </div>
  )
}

// ─── BADGES
const BADGES = [
  { id: 'founder',   label: 'Founder',    color: '#ffd700', icon: '★' },
  { id: 'builder',   label: 'Builder',    color: '#9b5cff', icon: '🔧' },
  { id: 'holder',    label: 'AETH Holder',color: '#ffd700', icon: '⚡' },
  { id: 'moderator', label: 'Moderator',  color: '#ff6666', icon: '🛡️' },
  { id: 'admin',     label: 'Admin',      color: '#ff4444', icon: '🔒' },
]

// ─── Profile Panel (slide-in or inline)
export default function UserProfile({ session, posts = [], onClose }) {
  const existing = getProfile(session?.fingerprint || '')
  const [handle, setHandle]   = useState(existing?.handle || '')
  const [bio, setBio]         = useState(existing?.bio || '')
  const [editing, setEditing] = useState(!existing?.handle)
  const [saved, setSaved]     = useState(false)

  const fp = session?.fingerprint || 'unknown'
  const role = session?.role || 'user'
  const badges = BADGES.filter(b => {
    if (b.id === 'admin') return role === 'admin'
    if (b.id === 'moderator') return role === 'moderator'
    return false
  })

  function save() {
    if (!handle.trim()) return
    saveProfile(fp, { handle: handle.trim(), bio: bio.trim() })
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const myPosts = posts.filter(p => !p.removed)

  return (
    <div style={{
      background: 'linear-gradient(135deg,#0f0e1a,#16142a)',
      border: '1px solid #2d2a4a', borderRadius: 16,
      padding: '28px 24px', width: '100%', maxWidth: 380,
      display: 'flex', flexDirection: 'column', gap: 18,
      boxShadow: '0 16px 48px rgba(124,58,237,0.18)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: 2 }}>YOUR PROFILE</span>
        {onClose && <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 16 }}>×</button>}
      </div>

      {/* Avatar + identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Avatar fingerprint={fp} handle={handle || fp} size={54} />
        <div>
          <div style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>
            {handle || <span style={{ color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>No handle yet</span>}
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: 1, marginTop: 2 }}>{fp}</div>
          <div style={{ display: 'flex', gap: 5, marginTop: 6, flexWrap: 'wrap' }}>
            {badges.map(b => (
              <span key={b.id} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, background: `${b.color}18`, border: `1px solid ${b.color}40`, color: b.color, fontFamily: 'monospace', fontWeight: 700 }}>
                {b.icon} {b.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Edit form */}
      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <label style={{ fontSize: 11, color: '#a78bfa', fontFamily: 'monospace', marginBottom: 4, display: 'block' }}>Handle</label>
            <input value={handle} onChange={e => setHandle(e.target.value.replace(/\s/g,'').slice(0,24))}
              placeholder="your_handle"
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, background: '#1e1c30', border: '1px solid #3b3560', color: '#e2e8f0', fontSize: 13, outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#a78bfa', fontFamily: 'monospace', marginBottom: 4, display: 'block' }}>Bio <span style={{ color: 'rgba(255,255,255,0.2)' }}>(optional)</span></label>
            <textarea value={bio} onChange={e => setBio(e.target.value.slice(0,120))}
              rows={2} placeholder="What's your signal?"
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, background: '#1e1c30', border: '1px solid #3b3560', color: '#e2e8f0', fontSize: 13, outline: 'none', fontFamily: 'monospace', resize: 'none', boxSizing: 'border-box' }} />
          </div>
          <button onClick={save} disabled={!handle.trim()} style={{ padding: '9px', borderRadius: 8, border: 'none', background: handle.trim() ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : 'rgba(255,255,255,0.06)', color: handle.trim() ? '#fff' : 'rgba(255,255,255,0.2)', fontWeight: 700, fontSize: 13, cursor: handle.trim() ? 'pointer' : 'default', fontFamily: 'monospace' }}>
            {saved ? '✓ Saved' : 'Save Profile'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {bio && <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, margin: 0 }}>{bio}</p>}
          <button onClick={() => setEditing(true)} style={{ alignSelf: 'flex-start', padding: '5px 12px', borderRadius: 7, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.4)', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace' }}>Edit Profile</button>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {[['Signals', myPosts.length], ['Rooms', 5], ['Since', 'Today']].map(([label, val]) => (
          <div key={label} style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 700, color: '#a78bfa' }}>{val}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
