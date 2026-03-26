import React, { useState } from 'react'

// Each room has its own personality
const ROOMS = [
  {
    id: 'general',
    label: '#general',
    desc: 'Open signals — everyone welcome',
    color: '#5b8cff',
    bg: 'radial-gradient(ellipse at 30% 0%, rgba(91,140,255,0.07) 0%, transparent 60%)',
    vibe: 'The main frequency. Everyone transmits here.',
    placeholder: 'Broadcast to the network…',
  },
  {
    id: 'dev',
    label: '#dev',
    desc: 'Builders, code, raw ideas',
    color: '#9b5cff',
    bg: 'radial-gradient(ellipse at 30% 0%, rgba(155,92,255,0.07) 0%, transparent 60%)',
    vibe: 'Ship fast. Break things. Leave no logs.',
    placeholder: 'Drop a build update, bug, or idea…',
  },
  {
    id: 'privacy',
    label: '#privacy',
    desc: 'Encryption, opsec, right to hide',
    color: '#00ffc3',
    bg: 'radial-gradient(ellipse at 30% 0%, rgba(0,255,195,0.06) 0%, transparent 60%)',
    vibe: 'The signal dies here. Nothing leaves this room.',
    placeholder: 'Share a tool, technique, or thought on privacy…',
  },
  {
    id: 'aether',
    label: '#aether',
    desc: 'AETH holders only — gated',
    color: '#ffd700',
    bg: 'radial-gradient(ellipse at 30% 0%, rgba(255,215,0,0.06) 0%, transparent 60%)',
    vibe: 'You earned access. This is where it matters.',
    placeholder: 'Holders only. Speak freely…',
    gated: true,
  },
  {
    id: 'random',
    label: '#random',
    desc: 'Noise, sparks, off-topic',
    color: '#ff6b6b',
    bg: 'radial-gradient(ellipse at 30% 0%, rgba(255,107,107,0.06) 0%, transparent 60%)',
    vibe: 'Chaos is a signal too.',
    placeholder: 'Anything goes…',
  },
]

const TOOLS = [
  { id: 'encrypt', label: 'Encrypt Message' },
  { id: 'thread',  label: 'Start Thread'    },
  { id: 'signal',  label: 'Signal Boost'    },
  { id: 'share',   label: 'Share Room'      },
]

function PostBox({ onPost, room }) {
  const [text, setText] = useState('')
  function submit() {
    if (!text.trim()) return
    onPost(text.trim())
    setText('')
  }
  return (
    <div style={{
      background: `${room.color}08`,
      border: `1px solid ${room.color}28`,
      borderRadius: 14, padding: '12px 16px', marginBottom: '1.25rem',
    }}>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submit() }}
        placeholder={room.placeholder}
        rows={3}
        style={{
          width: '100%', background: 'transparent', border: 'none', outline: 'none',
          color: '#f1f1f7', fontSize: 14, resize: 'none', fontFamily: 'inherit', lineHeight: 1.6,
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        <span style={{ fontSize: 11, color: `${room.color}60`, fontFamily: 'monospace' }}>Ctrl+Enter to send</span>
        <button
          onClick={submit}
          disabled={!text.trim()}
          style={{
            padding: '6px 18px', borderRadius: 8,
            background: text.trim() ? room.color : 'rgba(255,255,255,0.06)',
            border: 'none',
            color: text.trim() ? '#07060f' : 'rgba(255,255,255,0.25)',
            fontSize: 12, fontWeight: 700, cursor: text.trim() ? 'pointer' : 'default',
            transition: 'all 0.15s', fontFamily: 'monospace', letterSpacing: 1,
          }}
        >SEND</button>
      </div>
    </div>
  )
}

function PostCard({ post, room }) {
  const [signaled, setSignaled] = useState(false)
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: `1px solid rgba(255,255,255,0.06)`,
      borderRadius: 12, padding: '14px 16px',
      transition: 'border-color 0.2s, background 0.2s',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = `${room.color}35`
      e.currentTarget.style.background = `${room.color}05`
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
      e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
    }}
    >
      <div style={{ fontFamily: 'monospace', fontSize: 10, color: `${room.color}90`, marginBottom: 8, letterSpacing: 1 }}>
        {post.fingerprint}
      </div>
      <p style={{ fontSize: 14, color: '#e8e8f2', lineHeight: 1.65 }}>{post.text}</p>
      <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
        {[['Signal', true], ['Amplify', false], ['Reply', false], ['Recycle', false]].map(([label, isSignal]) => (
          <button
            key={label}
            onClick={isSignal ? () => setSignaled(s => !s) : undefined}
            style={{
              fontSize: 11, padding: '3px 10px', borderRadius: 6,
              background: isSignal && signaled ? `${room.color}20` : 'transparent',
              border: `1px solid ${isSignal && signaled ? room.color : 'rgba(255,255,255,0.08)'}`,
              color: isSignal && signaled ? room.color : 'rgba(255,255,255,0.35)',
              cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'monospace',
            }}
            onMouseEnter={e => { if (!(isSignal && signaled)) e.currentTarget.style.color = room.color }}
            onMouseLeave={e => { if (!(isSignal && signaled)) e.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}
          >{label}</button>
        ))}
      </div>
    </div>
  )
}

export default function RoomsView({ onViewProfile }) {
  const [activeRoom, setActiveRoom] = useState('general')
  const [postsByRoom, setPostsByRoom] = useState({
    general: [
      { id: '1', fingerprint: 'a1b2·c3d4', text: 'Conduit is live. No logs. No witnesses. Just signal.' },
      { id: '2', fingerprint: 'e5f6·g7h8', text: 'Privacy is not a feature — it is the foundation.' },
    ],
    dev: [
      { id: '1', fingerprint: 'x9y0·z1a2', text: 'WebSocket relay is stable. Latency under 40ms.' },
    ],
    privacy: [],
    aether: [],
    random: [
      { id: '1', fingerprint: 'b3c4·d5e6', text: 'why does my code work at 2am but not at 9am' },
    ],
  })

  const room = ROOMS.find(r => r.id === activeRoom)
  const posts = postsByRoom[activeRoom] || []

  function handlePost(text) {
    const fp = Math.random().toString(36).slice(2, 6) + '·' + Math.random().toString(36).slice(2, 6)
    setPostsByRoom(prev => ({
      ...prev,
      [activeRoom]: [{ id: Date.now().toString(), fingerprint: fp, text }, ...(prev[activeRoom] || [])],
    }))
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#07060f', color: '#f1f1f7', overflow: 'hidden' }}>

      {/* ROOM LIST */}
      <aside style={{
        width: 190, background: '#07060f',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        padding: '20px 0', flexShrink: 0, overflowY: 'auto',
      }}>
        <p style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: 2, padding: '0 16px', marginBottom: 10 }}>CHANNELS</p>
        {ROOMS.map(r => (
          <button key={r.id} onClick={() => setActiveRoom(r.id)} style={{
            width: '100%', textAlign: 'left', padding: '9px 16px',
            background: activeRoom === r.id ? `${r.color}12` : 'transparent',
            border: 'none', borderLeft: `2px solid ${activeRoom === r.id ? r.color : 'transparent'}`,
            cursor: 'pointer', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { if (activeRoom !== r.id) e.currentTarget.style.background = `${r.color}08` }}
          onMouseLeave={e => { if (activeRoom !== r.id) e.currentTarget.style.background = 'transparent' }}
          >
            <div style={{ fontFamily: 'monospace', fontSize: 13, color: activeRoom === r.id ? r.color : 'rgba(255,255,255,0.4)' }}>
              {r.label} {r.gated && <span style={{ fontSize: 9, color: '#ffd700' }}>🔒</span>}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 2 }}>{r.desc}</div>
          </button>
        ))}
      </aside>

      {/* MAIN FEED */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: room.bg }}>

        {/* ROOM HEADER */}
        <header style={{
          padding: '16px 24px',
          borderBottom: `1px solid ${room.color}22`,
          flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: 'monospace', fontSize: 17, fontWeight: 700, color: room.color }}>{room.label}</span>
              {room.gated && (
                <span style={{
                  fontSize: 10, color: '#ffd700', border: '1px solid rgba(255,215,0,0.3)',
                  padding: '2px 8px', borderRadius: 20, fontFamily: 'monospace', letterSpacing: 1,
                }}>AETH GATED</span>
              )}
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 3, fontStyle: 'italic' }}>{room.vibe}</p>
          </div>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>
            {posts.length} signal{posts.length !== 1 ? 's' : ''}
          </span>
        </header>

        {/* FEED */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          <PostBox onPost={handlePost} room={room} />
          {posts.length === 0 ? (
            <div style={{ textAlign: 'center', opacity: 0.3, marginTop: '5rem' }}>
              <p style={{ fontFamily: 'monospace', color: room.color, fontSize: 13 }}>No signals in {room.label} yet</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 6 }}>{room.vibe}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {posts.map(p => <PostCard key={p.id} post={p} room={room} />)}
            </div>
          )}
        </main>
      </div>

      {/* RIGHT SIDEBAR */}
      <aside style={{
        width: 210, background: '#07060f',
        borderLeft: '1px solid rgba(255,255,255,0.05)',
        padding: '20px 14px', flexShrink: 0, overflowY: 'auto',
      }}>
        <p style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: 2, marginBottom: 10 }}>TOOLS</p>
        {TOOLS.map(t => (
          <button key={t.id} style={{
            width: '100%', textAlign: 'left', padding: '8px 12px', marginBottom: 4,
            background: 'transparent', border: `1px solid rgba(255,255,255,0.06)`,
            borderRadius: 8, color: 'rgba(255,255,255,0.4)', fontSize: 12,
            cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'monospace',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = `${room.color}50`; e.currentTarget.style.color = room.color }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
          >{t.label}</button>
        ))}

        <p style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: 2, margin: '20px 0 10px' }}>ALL ROOMS</p>
        {ROOMS.map(r => (
          <div key={r.id} onClick={() => setActiveRoom(r.id)} style={{
            padding: '7px 10px', marginBottom: 3, borderRadius: 8,
            cursor: 'pointer', transition: 'background 0.15s',
            background: activeRoom === r.id ? `${r.color}12` : 'transparent',
            borderLeft: `2px solid ${activeRoom === r.id ? r.color : 'transparent'}`,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = `${r.color}0e` }}
          onMouseLeave={e => { e.currentTarget.style.background = activeRoom === r.id ? `${r.color}12` : 'transparent' }}
          >
            <span style={{ fontFamily: 'monospace', fontSize: 12, color: activeRoom === r.id ? r.color : 'rgba(255,255,255,0.4)' }}>
              {r.label} {r.gated && <span style={{ fontSize: 9, color: '#ffd700' }}>🔒</span>}
            </span>
          </div>
        ))}
      </aside>
    </div>
  )
}
