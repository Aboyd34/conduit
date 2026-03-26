import React, { useState, useEffect, useRef } from 'react'

const ROOMS = [
  {
    id: 'general',
    label: '#general',
    desc: 'Open signals — everyone welcome',
    color: '#5b8cff',
    bg: 'radial-gradient(ellipse at 30% 0%, rgba(91,140,255,0.07) 0%, transparent 60%)',
    vibe: 'The main frequency. Everyone transmits here.',
    placeholder: 'Broadcast to the network…',
    ai: {
      name: 'RELAY',
      avatar: '📡',
      greeting: "Signal locked in. I'm RELAY — I keep the frequency clean in #general. Ask me anything, or just start broadcasting. The network is listening.",
    },
  },
  {
    id: 'dev',
    label: '#dev',
    desc: 'Builders, code, raw ideas',
    color: '#9b5cff',
    bg: 'radial-gradient(ellipse at 30% 0%, rgba(155,92,255,0.07) 0%, transparent 60%)',
    vibe: 'Ship fast. Break things. Leave no logs.',
    placeholder: 'Drop a build update, bug, or idea…',
    ai: {
      name: 'FORGE',
      avatar: '⚡',
      greeting: "You\'re in #dev. I\'m FORGE. Drop your code, bugs, or half-baked ideas. I debug, review, and ship with you. No rubber ducks needed.",
    },
  },
  {
    id: 'privacy',
    label: '#privacy',
    desc: 'Encryption, opsec, right to hide',
    color: '#00ffc3',
    bg: 'radial-gradient(ellipse at 30% 0%, rgba(0,255,195,0.06) 0%, transparent 60%)',
    vibe: 'The signal dies here. Nothing leaves this room.',
    placeholder: 'Share a tool, technique, or thought on privacy…',
    ai: {
      name: 'NULL',
      avatar: '🔐',
      greeting: "I\'m NULL. I don\'t remember. I don\'t log. I don\'t judge. Ask me about encryption, opsec, threat models, or how to disappear. What\'s your concern?",
    },
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
    ai: {
      name: 'AETHER',
      avatar: '✨',
      greeting: "Welcome, holder. I\'m AETHER — the intelligence behind the token. You earned this room. Ask me about your allocation, governance, or what\'s coming next.",
    },
  },
  {
    id: 'random',
    label: '#random',
    desc: 'Noise, sparks, off-topic',
    color: '#ff6b6b',
    bg: 'radial-gradient(ellipse at 30% 0%, rgba(255,107,107,0.06) 0%, transparent 60%)',
    vibe: 'Chaos is a signal too.',
    placeholder: 'Anything goes…',
    ai: {
      name: 'STATIC',
      avatar: '🎲',
      greeting: "Yo. I\'m STATIC. No rules here. No topic. No filter. Say something weird. I\'ll say something weirder.",
    },
  },
]

const TOOLS = [
  { id: 'encrypt', label: 'Encrypt Message' },
  { id: 'thread',  label: 'Start Thread'    },
  { id: 'signal',  label: 'Signal Boost'    },
  { id: 'share',   label: 'Share Room'      },
]

// Typewriter effect for AI greeting
function useTypewriter(text, speed = 22) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  useEffect(() => {
    setDisplayed('')
    setDone(false)
    if (!text) return
    let i = 0
    const id = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) { clearInterval(id); setDone(true) }
    }, speed)
    return () => clearInterval(id)
  }, [text])
  return { displayed, done }
}

function AIGreeter({ room }) {
  const { displayed, done } = useTypewriter(room.ai.greeting)
  const [askText, setAskText] = useState('')
  const [reply, setReply] = useState('')
  const [thinking, setThinking] = useState(false)

  function handleAsk() {
    if (!askText.trim()) return
    setThinking(true)
    setReply('')
    // Simulated AI reply per room persona
    setTimeout(() => {
      const responses = {
        general: `Received. Amplifying your signal across the network.`,
        dev:     `Compiling… looks solid. Ship it and iterate.`,
        privacy: `Noted. Zero traces. That\'s how it should be.`,
        aether:  `Logged on-chain. Your signal has weight here.`,
        random:  `lol okay. chaotic. I respect it.`,
      }
      setReply(responses[room.id] || 'Signal acknowledged.')
      setThinking(false)
    }, 1200)
    setAskText('')
  }

  return (
    <div style={{
      background: `${room.color}0c`,
      border: `1px solid ${room.color}30`,
      borderRadius: 14, padding: '16px 18px',
      marginBottom: '1.5rem',
    }}>
      {/* AI header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: `${room.color}18`,
          border: `1px solid ${room.color}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18,
        }}>{room.ai.avatar}</div>
        <div>
          <div style={{ fontFamily: 'monospace', fontSize: 12, color: room.color, fontWeight: 700, letterSpacing: 1 }}>
            {room.ai.name} <span style={{ fontSize: 9, opacity: 0.5, fontWeight: 400 }}>AI · {room.label}</span>
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>Room Intelligence</div>
        </div>
        <div style={{
          marginLeft: 'auto', width: 7, height: 7, borderRadius: '50%',
          background: '#00ffc3',
          boxShadow: '0 0 6px #00ffc3',
        }} />
      </div>

      {/* Greeting typewriter */}
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, marginBottom: 12, minHeight: 40 }}>
        {displayed}{!done && <span style={{ opacity: 0.6, animation: 'none' }}>|</span>}
      </p>

      {/* AI reply */}
      {reply && (
        <div style={{
          background: `${room.color}10`, borderRadius: 8,
          padding: '8px 12px', marginBottom: 10,
          fontSize: 12, color: room.color, fontFamily: 'monospace',
        }}>
          {room.ai.name}: {reply}
        </div>
      )}
      {thinking && (
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', marginBottom: 10 }}>
          {room.ai.name} is thinking…
        </div>
      )}

      {/* Ask input */}
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <input
          value={askText}
          onChange={e => setAskText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleAsk() }}
          placeholder={`Ask ${room.ai.name} something…`}
          style={{
            flex: 1, background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${room.color}25`,
            borderRadius: 8, padding: '7px 12px',
            color: '#f1f1f7', fontSize: 12, outline: 'none',
            fontFamily: 'monospace',
          }}
        />
        <button
          onClick={handleAsk}
          disabled={!askText.trim()}
          style={{
            padding: '7px 14px', borderRadius: 8, border: 'none',
            background: askText.trim() ? room.color : 'rgba(255,255,255,0.06)',
            color: askText.trim() ? '#07060f' : 'rgba(255,255,255,0.2)',
            fontSize: 11, fontWeight: 700, cursor: askText.trim() ? 'pointer' : 'default',
            fontFamily: 'monospace', letterSpacing: 1, transition: 'all 0.15s',
          }}
        >ASK</button>
      </div>
    </div>
  )
}

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
      borderRadius: 14, padding: '12px 16px', marginBottom: '1rem',
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
    onMouseEnter={e => { e.currentTarget.style.borderColor = `${room.color}35`; e.currentTarget.style.background = `${room.color}05` }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
    >
      <div style={{ fontFamily: 'monospace', fontSize: 10, color: `${room.color}90`, marginBottom: 8, letterSpacing: 1 }}>
        {post.fingerprint}
      </div>
      <p style={{ fontSize: 14, color: '#e8e8f2', lineHeight: 1.65 }}>{post.text}</p>
      <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
        {[['Signal', true], ['Amplify', false], ['Reply', false], ['Recycle', false]].map(([label, isSignal]) => (
          <button key={label}
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
    const fp = Math.random().toString(36).slice(2,6) + '·' + Math.random().toString(36).slice(2,6)
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12 }}>{r.ai.avatar}</span>
              <span style={{ fontFamily: 'monospace', fontSize: 13, color: activeRoom === r.id ? r.color : 'rgba(255,255,255,0.4)' }}>
                {r.label} {r.gated && <span style={{ fontSize: 9, color: '#ffd700' }}>🔒</span>}
              </span>
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 2, paddingLeft: 18 }}>{r.desc}</div>
          </button>
        ))}
      </aside>

      {/* MAIN FEED */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: room.bg }}>

        {/* HEADER */}
        <header style={{
          padding: '14px 24px',
          borderBottom: `1px solid ${room.color}22`,
          flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 16 }}>{room.ai.avatar}</span>
              <span style={{ fontFamily: 'monospace', fontSize: 17, fontWeight: 700, color: room.color }}>{room.label}</span>
              {room.gated && (
                <span style={{ fontSize: 10, color: '#ffd700', border: '1px solid rgba(255,215,0,0.3)', padding: '2px 8px', borderRadius: 20, fontFamily: 'monospace', letterSpacing: 1 }}>AETH GATED</span>
              )}
            </div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 2, fontStyle: 'italic' }}>{room.vibe}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: room.color, fontFamily: 'monospace' }}>{room.ai.name}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>{posts.length} signal{posts.length !== 1 ? 's' : ''}</div>
          </div>
        </header>

        {/* FEED */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          <AIGreeter room={room} key={room.id} />
          <PostBox onPost={handlePost} room={room} />
          {posts.length === 0 ? (
            <div style={{ textAlign: 'center', opacity: 0.3, marginTop: '3rem' }}>
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
            padding: '7px 10px', marginBottom: 3, borderRadius: 8, cursor: 'pointer',
            transition: 'background 0.15s',
            background: activeRoom === r.id ? `${r.color}12` : 'transparent',
            borderLeft: `2px solid ${activeRoom === r.id ? r.color : 'transparent'}`,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = `${r.color}0e` }}
          onMouseLeave={e => { e.currentTarget.style.background = activeRoom === r.id ? `${r.color}12` : 'transparent' }}
          >
            <span style={{ fontSize: 11, marginRight: 5 }}>{r.ai.avatar}</span>
            <span style={{ fontFamily: 'monospace', fontSize: 12, color: activeRoom === r.id ? r.color : 'rgba(255,255,255,0.4)' }}>
              {r.label} {r.gated && <span style={{ fontSize: 9, color: '#ffd700' }}>🔒</span>}
            </span>
          </div>
        ))}
      </aside>
    </div>
  )
}
