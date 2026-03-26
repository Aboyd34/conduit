import React, { useState, useMemo } from 'react'

const ROOMS = ['general','dev','privacy','aether','random']
const ROOM_COLORS = { general:'#5b8cff', dev:'#9b5cff', privacy:'#00ffc3', aether:'#ffd700', random:'#ff6b6b' }

export default function AdminDashboard({ conduit, session }) {
  const [tab, setTab]           = useState('overview') // overview | modlog | fingerprints | rooms
  const [bannedFps, setBanned]  = useState(() => {
    try { return JSON.parse(localStorage.getItem('conduit_banned') || '[]') } catch { return [] }
  })
  const [roomProposals, setProposals] = useState(() => {
    try { return JSON.parse(localStorage.getItem('conduit_proposals') || '[]') } catch { return [] }
  })

  const allPosts = useMemo(() => {
    return ROOMS.flatMap(room =>
      (conduit.posts[room] || []).map(p => ({ ...p, room }))
    )
  }, [conduit.posts])

  const flaggedPosts = allPosts.filter(p => p.flagged && !p.removed)
  const totalPosts   = allPosts.filter(p => !p.removed).length
  const totalUsers   = new Set(allPosts.map(p => p.fingerprint)).size

  function banFp(fp) {
    const updated = [...bannedFps, fp]
    setBanned(updated)
    localStorage.setItem('conduit_banned', JSON.stringify(updated))
  }
  function unbanFp(fp) {
    const updated = bannedFps.filter(f => f !== fp)
    setBanned(updated)
    localStorage.setItem('conduit_banned', JSON.stringify(updated))
  }

  function approveProposal(id) {
    setProposals(prev => prev.map(p => p.id === id ? { ...p, approved: true } : p))
  }
  function denyProposal(id) {
    setProposals(prev => prev.filter(p => p.id !== id))
  }

  const TABS = [
    { id: 'overview',      label: '📊 Overview'   },
    { id: 'modlog',        label: '🛡️ Flagged'    },
    { id: 'fingerprints',  label: '👥 Users'       },
    { id: 'rooms',         label: '📶 Proposals'  },
  ]

  return (
    <div style={{ padding: '16px 14px', maxWidth: 620, margin: '0 auto', paddingBottom: 80, color: '#e2e8f0' }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 20 }}>🛡️</span>
          <h1 style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 900, margin: 0, color: '#ff6666' }}>Admin Dashboard</h1>
        </div>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', margin: 0, fontFamily: 'monospace' }}>Logged in as {session?.fingerprint?.slice(0,16)}… · role: admin</p>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '7px 14px', borderRadius: 8, border: '1px solid',
            borderColor: tab === t.id ? '#ff6666' : 'rgba(255,255,255,0.08)',
            background: tab === t.id ? 'rgba(255,100,100,0.1)' : 'transparent',
            color: tab === t.id ? '#ff8888' : 'rgba(255,255,255,0.35)',
            fontSize: 12, cursor: 'pointer', fontFamily: 'monospace',
          }}>{t.label}</button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
            {[
              { label: 'Total Signals', value: totalPosts, color: '#5b8cff' },
              { label: 'Unique Users',  value: totalUsers, color: '#a78bfa' },
              { label: 'Flagged Posts', value: flaggedPosts.length, color: '#ff6666' },
              { label: 'Banned FPs',   value: bannedFps.length,   color: '#ff8888' },
            ].map(stat => (
              <div key={stat.label} style={{ flex: '1 1 120px', background: '#0f0e1a', border: '1px solid #2d2a4a', borderRadius: 12, padding: '14px 12px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'monospace', fontSize: 24, fontWeight: 900, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Per-room signal counts */}
          <div style={{ background: '#0f0e1a', border: '1px solid #2d2a4a', borderRadius: 14, padding: '16px 18px' }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', letterSpacing: 2, marginBottom: 12 }}>SIGNALS PER ROOM</div>
            {ROOMS.map(room => {
              const count = (conduit.posts[room] || []).filter(p => !p.removed).length
              const pct   = totalPosts ? Math.round(count / totalPosts * 100) : 0
              return (
                <div key={room} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 12, color: ROOM_COLORS[room] }}>#{room}</span>
                    <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{count} signals · {pct}%</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: ROOM_COLORS[room], borderRadius: 4 }} />
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* FLAGGED POSTS */}
      {tab === 'modlog' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {flaggedPosts.length === 0 ? (
            <div style={{ textAlign: 'center', opacity: 0.3, padding: 40 }}>
              <div style={{ fontSize: 28 }}>✅</div>
              <p style={{ fontFamily: 'monospace', fontSize: 12, marginTop: 8 }}>No flagged posts.</p>
            </div>
          ) : flaggedPosts.map(post => (
            <div key={post.id} style={{ background: 'rgba(255,60,60,0.05)', border: '1px solid rgba(255,60,60,0.2)', borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontFamily: 'monospace', fontSize: 10, color: ROOM_COLORS[post.room] }}>#{post.room} · {post.fingerprint}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => conduit.removePost(post.room, post.id)} style={s.dangerBtn}>Remove</button>
                  <button onClick={() => banFp(post.fingerprint)} style={s.warnBtn}>Ban FP</button>
                </div>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.5 }}>{post.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* FINGERPRINTS */}
      {tab === 'fingerprints' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', letterSpacing: 2, marginBottom: 8 }}>BANNED FINGERPRINTS ({bannedFps.length})</div>
          {bannedFps.length === 0 && (
            <div style={{ textAlign: 'center', opacity: 0.3, padding: 30 }}>
              <p style={{ fontFamily: 'monospace', fontSize: 12 }}>No banned fingerprints.</p>
            </div>
          )}
          {bannedFps.map(fp => (
            <div key={fp} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f0e1a', border: '1px solid rgba(255,100,100,0.2)', borderRadius: 10, padding: '10px 14px' }}>
              <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#ff8888' }}>{fp}</span>
              <button onClick={() => unbanFp(fp)} style={s.ghostBtn}>Unban</button>
            </div>
          ))}
        </div>
      )}

      {/* ROOM PROPOSALS */}
      {tab === 'rooms' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {roomProposals.length === 0 && (
            <div style={{ textAlign: 'center', opacity: 0.3, padding: 40 }}>
              <div style={{ fontSize: 28 }}>📶</div>
              <p style={{ fontFamily: 'monospace', fontSize: 12, marginTop: 8 }}>No room proposals yet.</p>
            </div>
          )}
          {roomProposals.map(p => (
            <div key={p.id} style={{ background: `${p.color}08`, border: `1px solid ${p.color}30`, borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: p.color }}>#{p.id.replace('custom_','')}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>{p.desc}</div>
                  <div style={{ fontSize: 10, fontFamily: 'monospace', color: 'rgba(255,255,255,0.2)', marginTop: 4 }}>Proposed by {p.proposedBy || 'unknown'}</div>
                </div>
                {!p.approved && (
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button onClick={() => approveProposal(p.id)} style={s.approveBtn}>✓ Approve</button>
                    <button onClick={() => denyProposal(p.id)} style={s.dangerBtn}>✗ Deny</button>
                  </div>
                )}
                {p.approved && <span style={{ fontSize: 11, color: '#00ffc3', fontFamily: 'monospace', border: '1px solid rgba(0,255,195,0.3)', padding: '2px 8px', borderRadius: 6 }}>✓ Live</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const s = {
  dangerBtn:  { padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(255,60,60,0.3)', background: 'rgba(255,60,60,0.08)', color: '#ff6666', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace' },
  warnBtn:    { padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(255,200,0,0.3)', background: 'rgba(255,200,0,0.08)', color: '#ffcc00', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace' },
  ghostBtn:   { padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.35)', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace' },
  approveBtn: { padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(0,255,195,0.3)', background: 'rgba(0,255,195,0.08)', color: '#00ffc3', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace' },
}
