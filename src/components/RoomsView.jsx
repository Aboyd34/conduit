import React, { useState } from 'react'

const ROOMS = [
  { id: 'general',  label: '#general',  desc: 'Open signals — everyone welcome',          color: '#5b8cff' },
  { id: 'dev',      label: '#dev',      desc: 'Builders, code, and raw ideas',             color: '#9b5cff' },
  { id: 'privacy',  label: '#privacy',  desc: 'Encryption, opsec, and the right to hide', color: '#00ffc3' },
  { id: 'aether',   label: '#aether',   desc: 'AETH holders only — gated access',         color: '#ffd700', gated: true },
  { id: 'random',   label: '#random',   desc: 'Noise, memes, and off-topic sparks',        color: '#ff6b6b' },
]

const TOOLS = [
  { id: 'encrypt', label: 'Encrypt Message' },
  { id: 'thread',  label: 'Start Thread'    },
  { id: 'signal',  label: 'Signal Boost'    },
  { id: 'share',   label: 'Share Room'      },
]

function PostBox({ onPost }) {
  const [text, setText] = useState('')
  function submit() {
    if (!text.trim()) return
    onPost(text.trim())
    setText('')
  }
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(91,140,255,0.2)',
      borderRadius: 14, padding: '12px 16px', marginBottom: '1.5rem',
    }}>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submit() }}
        placeholder="Broadcast a signal… (Ctrl+Enter to send)"
        rows={3}
        style={{
          width: '100%', background: 'transparent', border: 'none', outline: 'none',
          color: '#f1f1f7', fontSize: 14, resize: 'none', fontFamily: 'inherit',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <button
          onClick={submit}
          disabled={!text.trim()}
          style={{
            padding: '6px 18px', borderRadius: 8,
            background: text.trim() ? 'linear-gradient(135deg,#5b8cff,#9b5cff)' : 'rgba(255,255,255,0.06)',
            border: 'none', color: text.trim() ? '#fff' : 'rgba(255,255,255,0.3)',
            fontSize: 13, fontWeight: 600, cursor: text.trim() ? 'pointer' : 'default', transition: 'all 0.15s',
          }}
        >Send Signal</button>
      </div>
    </div>
  )
}

function PostCard({ post, roomColor }) {
  const [signaled, setSignaled] = useState(false)
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: `1px solid rgba(255,255,255,0.07)`,
      borderRadius: 14, padding: '14px 16px',
      transition: 'border-color 0.2s',
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = `${roomColor}40`}
    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
    >
      <div style={{ fontFamily: 'monospace', fontSize: 11, color: roomColor, marginBottom: 6 }}>{post.fingerprint}</div>
      <p style={{ fontSize: 14, color: '#e0e0f0', lineHeight: 1.6 }}>{post.text}</p>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        {[['⚡ Signal', () => setSignaled(s => !s)], ['🔁 Amplify', null], ['💬 Reply', null], ['♻ Recycle', null]].map(([label, fn]) => (
          <button key={label} onClick={fn || undefined} style={{
            fontSize: 11, padding: '4px 10px', borderRadius: 6,
            background: label.includes('Signal') && signaled ? `${roomColor}22` : 'rgba(255,255,255,0.04)',
            border: `1px solid ${label.includes('Signal') && signaled ? roomColor : 'rgba(255,255,255,0.08)'}`,
            color: label.includes('Signal') && signaled ? roomColor : 'rgba(255,255,255,0.45)',
            cursor: 'pointer', transition: 'all 0.15s',
          }}>{label}</button>
        ))}
      </div>
    </div>
  )
}

export default function RoomsView({ onViewProfile }) {
  const [activeRoom, setActiveRoom] = useState('general')
  const [posts, setPosts] = useState([
    { id: '1', fingerprint: 'a1b2·c3d4', text: 'Conduit is live. No logs. No witnesses. Just signal.' },
    { id: '2', fingerprint: 'e5f6·g7h8', text: 'Privacy is not a feature — it is the foundation.' },
    { id: '3', fingerprint: 'x9y0·z1a2', text: 'First signal from the #general room. The network is awake.' },
  ])

  const room = ROOMS.find(r => r.id === activeRoom) || ROOMS[0]

  function handlePost(text) {
    const fp = Math.random().toString(36).slice(2, 6) + '·' + Math.random().toString(36).slice(2, 6)
    setPosts(prev => [{ id: Date.now().toString(), fingerprint: fp, text }, ...prev])
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#07060f', color: '#f1f1f7', overflow: 'hidden' }}>

      {/* ROOM LIST */}
      <aside style={{
        width: 200, background: '#08071a',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        padding: '20px 0', display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0,
      }}>
        <p style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: 2, padding: '0 16px', marginBottom: 8 }}>ROOMS</p>
        {ROOMS.map(r => (
          <button key={r.id} onClick={() => setActiveRoom(r.id)} style={{
            width: '100%', textAlign: 'left', padding: '8px 16px',
            background: activeRoom === r.id ? `${r.color}14` : 'transparent',
            border: 'none', borderLeft: `2px solid ${activeRoom === r.id ? r.color : 'transparent'}`,
            color: activeRoom === r.id ? r.color : 'rgba(255,255,255,0.45)',
            fontSize: 13, fontFamily: 'monospace', cursor: 'pointer', transition: 'all 0.15s',
          }}>
            {r.label} {r.gated && <span style={{ fontSize: 9, color: '#ffd700', marginLeft: 4 }}>🔒</span>}
          </button>
        ))}
      </aside>

      {/* MAIN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* HEADER */}
        <header style={{
          padding: '14px 24px',
          borderBottom: `1px solid ${room.color}28`,
          background: `linear-gradient(90deg, ${room.color}0a 0%, transparent 60%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
        }}>
          <div>
            <span style={{ fontFamily: 'monospace', fontSize: 16, color: room.color }}>{room.label}</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginLeft: 12 }}>{room.desc}</span>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
              {posts.length} signals
            </span>
            {room.gated && (
              <span style={{ fontSize: 11, color: '#ffd700', fontFamily: 'monospace', border: '1px solid rgba(255,215,0,0.3)', padding: '2px 8px', borderRadius: 20 }}>
                🔒 AETH Gated
              </span>
            )}
          </div>
        </header>

        {/* FEED */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          <PostBox onPost={handlePost} />

          {posts.length === 0 ? (
            <div style={{ textAlign: 'center', opacity: 0.35, marginTop: '4rem' }}>
              <p style={{ fontFamily: 'monospace', color: room.color, fontSize: 13 }}>No signals yet</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 6 }}>Be the first to broadcast in {room.label}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {posts.map(p => <PostCard key={p.id} post={p} roomColor={room.color} />)}
            </div>
          )}
        </main>
      </div>

      {/* RIGHT SIDEBAR */}
      <aside style={{
        width: 220, background: '#08071a',
        borderLeft: '1px solid rgba(255,255,255,0.05)',
        padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 24, flexShrink: 0, overflowY: 'auto',
      }}>
        <div>
          <p style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: 2, marginBottom: 10 }}>TOOLS</p>
          {TOOLS.map(t => (
            <button key={t.id} style={{
              width: '100%', textAlign: 'left', padding: '8px 12px', marginBottom: 4,
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 8, color: 'rgba(255,255,255,0.5)', fontSize: 12,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = `${room.color}50`; e.currentTarget.style.color = room.color; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
            >{t.label}</button>
          ))}
        </div>

        <div>
          <p style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: 2, marginBottom: 10 }}>ALL ROOMS</p>
          {ROOMS.map(r => (
            <div key={r.id} onClick={() => setActiveRoom(r.id)} style={{
              padding: '6px 8px', marginBottom: 4, borderRadius: 6,
              cursor: 'pointer', transition: 'background 0.15s',
              background: activeRoom === r.id ? `${r.color}14` : 'transparent',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = `${r.color}10`; }}
            onMouseLeave={e => { e.currentTarget.style.background = activeRoom === r.id ? `${r.color}14` : 'transparent'; }}
            >
              <span style={{ fontFamily: 'monospace', fontSize: 12, color: r.color }}>{r.label}</span>
              {r.gated && <span style={{ fontSize: 9, color: '#ffd700', marginLeft: 6 }}>🔒</span>}
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>{r.desc}</p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  )
}
