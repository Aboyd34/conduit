import React, { useState, useEffect, useRef } from 'react'

// ─── ROLE SYSTEM ──────────────────────────────────────────────────────────────
const canModerate = (role) => role === 'admin' || role === 'moderator'

// ─── ICONS ───────────────────────────────────────────────────────────────────
const RoomIcon = ({ id, color, size = 14 }) => {
  const s = { width: size, height: size, fill: 'none', stroke: color, strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (id) {
    case 'general': return <svg {...s} viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
    case 'dev':     return <svg {...s} viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
    case 'privacy': return <svg {...s} viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
    case 'aether':  return <svg {...s} viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
    case 'random':  return <svg {...s} viewBox="0 0 24 24"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>
    default: return null
  }
}
const AIIcon = ({ id, color, size = 20 }) => {
  const s = { width: size, height: size, fill: 'none', stroke: color, strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (id) {
    case 'general': return <svg {...s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></svg>
    case 'dev':     return <svg {...s} viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
    case 'privacy': return <svg {...s} viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    case 'aether':  return <svg {...s} viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
    case 'random':  return <svg {...s} viewBox="0 0 24 24"><path d="M2 12h3l3-8 4 16 3-10 2 4 2-2h3"/></svg>
    default: return null
  }
}
const IconImage  = ({ color }) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
const IconVideo  = ({ color }) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
const IconClose  = ({ color }) => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IconShield = ({ color, size = 14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
const IconWarn   = ({ color, size = 13 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
const IconTrash  = ({ color, size = 13 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
const IconMenu   = ({ color }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
const IconLock   = ({ color, size = 14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>

// ─── AI MOD ENGINE ────────────────────────────────────────────────────────────
const MOD_RULES = {
  general: ['spam', 'hate', 'slur', 'scam', 'porn', 'nsfw', 'racist', 'sexist'],
  dev:     ['spam', 'hate', 'slur', 'scam', 'porn', 'nsfw', 'racist', 'sexist'],
  privacy: ['spam', 'doxx', 'expose', 'scam', 'porn', 'nsfw', 'racist', 'sexist'],
  aether:  ['spam', 'scam', 'rug', 'porn', 'nsfw', 'racist', 'sexist', 'hate'],
  random:  ['spam', 'scam', 'porn', 'nsfw', 'racist', 'sexist', 'hate', 'slur'],
}
const MOD_RESPONSES = {
  general: (w) => `Signal flagged. "${w}" violates #general standards. Keep the frequency clean.`,
  dev:     (w) => `FORGE flagged this. "${w}" doesn't belong in #dev. This room is for builders.`,
  privacy: (w) => `NULL detected a violation: "${w}". This room protects people — not threats.`,
  aether:  (w) => `AETHER flagged "${w}". Holders are held to a higher standard.`,
  random:  (w) => `Even STATIC has limits. "${w}" crossed the line. Watch it.`,
}
function scanPost(text, roomId) {
  const lower = text.toLowerCase()
  for (const word of (MOD_RULES[roomId] || [])) {
    if (lower.includes(word)) return word
  }
  return null
}

// ─── ROOMS CONFIG ─────────────────────────────────────────────────────────────
const ROOMS = [
  {
    id: 'general', label: '#general', desc: 'Open signals — everyone welcome',
    color: '#5b8cff',
    bg: 'radial-gradient(ellipse at 30% 0%, rgba(91,140,255,0.07) 0%, transparent 60%)',
    vibe: 'The main frequency. Everyone transmits here.',
    placeholder: 'Broadcast to the network…',
    ai: { name: 'RELAY', greeting: "Signal locked in. I'm RELAY — I keep the frequency clean in #general. Ask me anything, or just start broadcasting. The network is listening." },
  },
  {
    id: 'dev', label: '#dev', desc: 'Builders, code, raw ideas',
    color: '#9b5cff',
    bg: 'radial-gradient(ellipse at 30% 0%, rgba(155,92,255,0.07) 0%, transparent 60%)',
    vibe: 'Ship fast. Break things. Leave no logs.',
    placeholder: 'Drop a build update, bug, or idea…',
    ai: { name: 'FORGE', greeting: "You're in #dev. I'm FORGE. Drop your code, bugs, or half-baked ideas. I debug, review, and ship with you. No rubber ducks needed." },
  },
  {
    id: 'privacy', label: '#privacy', desc: 'Encryption, opsec, right to hide',
    color: '#00ffc3',
    bg: 'radial-gradient(ellipse at 30% 0%, rgba(0,255,195,0.06) 0%, transparent 60%)',
    vibe: 'The signal dies here. Nothing leaves this room.',
    placeholder: 'Share a tool, technique, or thought on privacy…',
    ai: { name: 'NULL', greeting: "I'm NULL. I don't remember. I don't log. I don't judge. Ask me about encryption, opsec, threat models, or how to disappear. What's your concern?" },
  },
  {
    id: 'aether', label: '#aether', desc: 'AETH holders only — gated',
    color: '#ffd700', gated: true,
    bg: 'radial-gradient(ellipse at 30% 0%, rgba(255,215,0,0.06) 0%, transparent 60%)',
    vibe: 'You earned access. This is where it matters.',
    placeholder: 'Holders only. Speak freely…',
    ai: { name: 'AETHER', greeting: "Welcome, holder. I'm AETHER — the intelligence behind the token. You earned this room. Ask me about your allocation, governance, or what's coming next." },
  },
  {
    id: 'random', label: '#random', desc: 'Noise, sparks, off-topic',
    color: '#ff6b6b',
    bg: 'radial-gradient(ellipse at 30% 0%, rgba(255,107,107,0.06) 0%, transparent 60%)',
    vibe: 'Chaos is a signal too.',
    placeholder: 'Anything goes…',
    ai: { name: 'STATIC', greeting: "Yo. I'm STATIC. No rules here. No topic. No filter. Say something weird. I'll say something weirder." },
  },
]
const TOOLS = [
  { id: 'encrypt', label: 'Encrypt Message' },
  { id: 'thread',  label: 'Start Thread'    },
  { id: 'signal',  label: 'Signal Boost'    },
  { id: 'share',   label: 'Share Room'      },
]

// ─── TYPEWRITER ───────────────────────────────────────────────────────────────
function useTypewriter(text, speed = 22) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  useEffect(() => {
    setDisplayed(''); setDone(false)
    if (!text) return
    let i = 0
    const id = setInterval(() => {
      i++; setDisplayed(text.slice(0, i))
      if (i >= text.length) { clearInterval(id); setDone(true) }
    }, speed)
    return () => clearInterval(id)
  }, [text])
  return { displayed, done }
}

// ─── AETHER GATE WALL ────────────────────────────────────────────────────────
function AetherGateWall() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '3rem 2rem', textAlign: 'center', gap: 20 }}>
      <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <IconLock color="#ffd700" size={28} />
      </div>
      <div>
        <h2 style={{ color: '#ffd700', fontFamily: 'monospace', fontSize: 18, fontWeight: 800, letterSpacing: 2, marginBottom: 8 }}>AETHER GATED</h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, lineHeight: 1.7, maxWidth: 340 }}>
          This room requires <strong style={{ color: '#ffd700' }}>100 AETH</strong> to access.<br />
          Hold the token. Earn the room.
        </p>
      </div>
      <a href="/about.html" style={{ padding: '10px 24px', borderRadius: 10, background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', color: '#ffd700', fontSize: 13, fontFamily: 'monospace', fontWeight: 700, textDecoration: 'none', letterSpacing: 1 }}>Learn About AETH ⚡</a>
    </div>
  )
}

// ─── AI GREETER ───────────────────────────────────────────────────────────────
function AIGreeter({ room }) {
  const { displayed, done } = useTypewriter(room.ai.greeting)
  const [askText, setAskText] = useState('')
  const [reply, setReply]     = useState('')
  const [thinking, setThinking] = useState(false)
  function handleAsk() {
    if (!askText.trim()) return
    setThinking(true); setReply('')
    setTimeout(() => {
      const r = { general: 'Received. Amplifying your signal.', dev: 'Compiling… Ship it.', privacy: 'Noted. Zero traces.', aether: 'Logged on-chain.', random: 'lol okay. I respect it.' }
      setReply(r[room.id] || 'Signal acknowledged.')
      setThinking(false)
    }, 1200)
    setAskText('')
  }
  return (
    <div style={{ background: `${room.color}0c`, border: `1px solid ${room.color}30`, borderRadius: 14, padding: '16px 18px', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${room.color}18`, border: `1px solid ${room.color}45`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <AIIcon id={room.id} color={room.color} size={18} />
        </div>
        <div>
          <div style={{ fontFamily: 'monospace', fontSize: 12, color: room.color, fontWeight: 700, letterSpacing: 1 }}>
            {room.ai.name} <span style={{ fontSize: 9, opacity: 0.4, fontWeight: 400, marginLeft: 4 }}>AI · {room.label}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'rgba(255,255,255,0.22)' }}>
            <IconShield color="rgba(255,255,255,0.3)" size={10} /> Room Intelligence + Moderator
          </div>
        </div>
        <div style={{ marginLeft: 'auto', width: 7, height: 7, borderRadius: '50%', background: '#00ffc3', boxShadow: '0 0 6px #00ffc3' }} />
      </div>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)', lineHeight: 1.7, marginBottom: 12, minHeight: 40 }}>
        {displayed}{!done && <span style={{ opacity: 0.5 }}>|</span>}
      </p>
      {reply && <div style={{ background: `${room.color}10`, borderRadius: 8, padding: '8px 12px', marginBottom: 10, fontSize: 12, color: room.color, fontFamily: 'monospace' }}>{room.ai.name}: {reply}</div>}
      {thinking && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', fontFamily: 'monospace', marginBottom: 10 }}>{room.ai.name} is thinking…</div>}
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={askText} onChange={e => setAskText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAsk()}
          placeholder={`Ask ${room.ai.name} something…`}
          style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: `1px solid ${room.color}25`, borderRadius: 8, padding: '7px 12px', color: '#f1f1f7', fontSize: 12, outline: 'none', fontFamily: 'monospace' }} />
        <button onClick={handleAsk} disabled={!askText.trim()} style={{
          padding: '7px 14px', borderRadius: 8, border: 'none',
          background: askText.trim() ? room.color : 'rgba(255,255,255,0.06)',
          color: askText.trim() ? '#07060f' : 'rgba(255,255,255,0.2)',
          fontSize: 11, fontWeight: 700, cursor: askText.trim() ? 'pointer' : 'default',
          fontFamily: 'monospace', letterSpacing: 1, transition: 'all 0.15s',
        }}>ASK</button>
      </div>
    </div>
  )
}

// ─── MOD ALERT ────────────────────────────────────────────────────────────────
function ModAlert({ room, message, onDismiss }) {
  return (
    <div style={{ background: 'rgba(255,60,60,0.07)', border: '1px solid rgba(255,60,60,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 10, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <IconShield color="#ff4444" size={15} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 10, color: '#ff6666', fontFamily: 'monospace', fontWeight: 700, marginBottom: 3 }}>{room.ai.name} · AI MODERATOR</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{message}</div>
      </div>
      <button onClick={onDismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}><IconClose color="rgba(255,255,255,0.3)" /></button>
    </div>
  )
}

// ─── POST BOX ─────────────────────────────────────────────────────────────────
function PostBox({ onPost, room }) {
  const [text, setText]   = useState('')
  const [media, setMedia] = useState(null)
  const imgRef = useRef()
  const vidRef = useRef()
  function handleMedia(e, type) {
    const file = e.target.files[0]
    if (!file) return
    setMedia({ url: URL.createObjectURL(file), type, name: file.name })
    e.target.value = ''
  }
  function submit() {
    if (!text.trim() && !media) return
    onPost(text.trim(), media)
    setText(''); setMedia(null)
  }
  const canSend = text.trim() || media
  return (
    <div style={{ background: `${room.color}08`, border: `1px solid ${room.color}28`, borderRadius: 14, padding: '12px 16px', marginBottom: '1rem' }}>
      <textarea value={text} onChange={e => setText(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && (e.ctrlKey || e.metaKey) && submit()}
        placeholder={room.placeholder} rows={3}
        style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: '#f1f1f7', fontSize: 14, resize: 'none', fontFamily: 'inherit', lineHeight: 1.6 }}
      />
      {media && (
        <div style={{ position: 'relative', marginBottom: 10, display: 'inline-block' }}>
          {media.type === 'image'
            ? <img src={media.url} alt="preview" style={{ maxHeight: 180, maxWidth: '100%', borderRadius: 8, display: 'block', border: `1px solid ${room.color}30` }} />
            : <video src={media.url} controls style={{ maxHeight: 180, maxWidth: '100%', borderRadius: 8, display: 'block', border: `1px solid ${room.color}30` }} />
          }
          <button onClick={() => setMedia(null)} style={{ position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <IconClose color="#fff" />
          </button>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <input ref={imgRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleMedia(e, 'image')} />
          <input ref={vidRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={e => handleMedia(e, 'video')} />
          {[{ ref: imgRef, Icon: IconImage }, { ref: vidRef, Icon: IconVideo }].map(({ ref, Icon }, i) => (
            <button key={i} onClick={() => ref.current.click()} style={{ width: 32, height: 32, borderRadius: 7, border: '1px solid rgba(255,255,255,0.09)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = `${room.color}60`}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'}>
              <Icon color="rgba(255,255,255,0.4)" />
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 10, color: `${room.color}50`, fontFamily: 'monospace' }}>Ctrl+Enter</span>
          <button onClick={submit} disabled={!canSend} style={{ padding: '6px 18px', borderRadius: 8, border: 'none', background: canSend ? room.color : 'rgba(255,255,255,0.06)', color: canSend ? '#07060f' : 'rgba(255,255,255,0.25)', fontSize: 12, fontWeight: 700, cursor: canSend ? 'pointer' : 'default', transition: 'all 0.15s', fontFamily: 'monospace', letterSpacing: 1 }}>SEND</button>
        </div>
      </div>
    </div>
  )
}

// ─── POST CARD ────────────────────────────────────────────────────────────────
function PostCard({ post, room, onRemove, isMod }) {
  const [signaled, setSignaled] = useState(false)
  if (post.removed) return (
    <div style={{ background: 'rgba(255,60,60,0.04)', border: '1px solid rgba(255,60,60,0.15)', borderRadius: 12, padding: '12px 16px' }}>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 5 }}>
        <IconShield color="rgba(255,80,80,0.5)" size={11} /> Signal removed by {room.ai.name}
      </div>
    </div>
  )
  return (
    <div style={{ background: post.flagged ? 'rgba(255,60,60,0.04)' : 'rgba(255,255,255,0.02)', border: `1px solid ${post.flagged ? 'rgba(255,60,60,0.25)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 12, padding: '14px 16px', transition: 'border-color 0.2s' }}
    onMouseEnter={e => { if (!post.flagged) { e.currentTarget.style.borderColor = `${room.color}35`; e.currentTarget.style.background = `${room.color}05` }}}
    onMouseLeave={e => { if (!post.flagged) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontFamily: 'monospace', fontSize: 10, color: post.flagged ? '#ff6666' : `${room.color}90`, marginBottom: 8, letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
          {post.flagged && <IconWarn color="#ff6666" size={10} />}{post.fingerprint}
        </div>
        {isMod && !post.removed && (
          <div style={{ display: 'flex', gap: 4 }}>
            <button title="Warn user" onClick={() => onRemove(post.id, 'warn')} style={{ background: 'transparent', border: '1px solid rgba(255,200,0,0.2)', borderRadius: 5, padding: '2px 6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><IconWarn color="#ffcc00" size={11} /></button>
            <button title="Remove post" onClick={() => onRemove(post.id, 'remove')} style={{ background: 'transparent', border: '1px solid rgba(255,60,60,0.2)', borderRadius: 5, padding: '2px 6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><IconTrash color="#ff4444" size={11} /></button>
          </div>
        )}
      </div>
      {post.text && <p style={{ fontSize: 14, color: '#e8e8f2', lineHeight: 1.65, marginBottom: post.media ? 10 : 0 }}>{post.text}</p>}
      {post.media && (
        post.media.type === 'image'
          ? <img src={post.media.url} alt="" style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8, display: 'block', border: `1px solid ${room.color}25` }} />
          : <video src={post.media.url} controls style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8, display: 'block', border: `1px solid ${room.color}25` }} />
      )}
      <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
        {[['Signal', true], ['Amplify', false], ['Reply', false]].map(([label, isSignal]) => (
          <button key={label} onClick={isSignal ? () => setSignaled(s => !s) : undefined} style={{
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

// ─── MOD LOG PANEL ────────────────────────────────────────────────────────────
function ModLog({ log }) {
  return (
    <div>
      <p style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: 2, margin: '20px 0 8px', display: 'flex', alignItems: 'center', gap: 5 }}>
        <IconShield color="rgba(255,255,255,0.2)" size={9} /> MOD LOG
      </p>
      {log.length === 0
        ? <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.15)', fontFamily: 'monospace', fontStyle: 'italic' }}>No actions yet</div>
        : log.slice().reverse().map((entry, i) => (
          <div key={i} style={{ marginBottom: 6, padding: '6px 8px', borderRadius: 6, background: entry.action === 'remove' ? 'rgba(255,60,60,0.07)' : 'rgba(255,200,0,0.05)', border: `1px solid ${entry.action === 'remove' ? 'rgba(255,60,60,0.18)' : 'rgba(255,200,0,0.15)'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
              {entry.action === 'remove' ? <IconTrash color="#ff4444" size={10} /> : <IconWarn color="#ffcc00" size={10} />}
              <span style={{ fontSize: 9, fontFamily: 'monospace', color: entry.action === 'remove' ? '#ff6666' : '#ffcc00', fontWeight: 700, letterSpacing: 0.5 }}>{entry.action.toUpperCase()}</span>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', marginLeft: 'auto' }}>{entry.time}</span>
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>post {entry.fp}</div>
            {entry.reason && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 2, fontStyle: 'italic' }}>{entry.reason}</div>}
          </div>
        ))
      }
    </div>
  )
}

// ─── MAIN VIEW ────────────────────────────────────────────────────────────────
export default function RoomsView({ onViewProfile, userRole = 'user', isAetherHolder = false }) {
  const isMod   = canModerate(userRole)
  const isAdmin = userRole === 'admin'

  const [activeRoom, setActiveRoom]   = useState('general')
  const [modLog, setModLog]           = useState([])
  const [modAlerts, setModAlerts]     = useState([])
  const [drawerOpen, setDrawerOpen]   = useState(false)
  const [sideOpen, setSideOpen]       = useState(false)

  const [postsByRoom, setPostsByRoom] = useState({
    general: [
      { id: '1', fingerprint: 'a1b2·c3d4', text: 'Conduit is live. No logs. No witnesses. Just signal.' },
      { id: '2', fingerprint: 'e5f6·g7h8', text: 'Privacy is not a feature — it is the foundation.' },
    ],
    dev:     [{ id: '1', fingerprint: 'x9y0·z1a2', text: 'WebSocket relay is stable. Latency under 40ms.' }],
    privacy: [],
    aether:  [],
    random:  [{ id: '1', fingerprint: 'b3c4·d5e6', text: 'why does my code work at 2am but not at 9am' }],
  })

  const room       = ROOMS.find(r => r.id === activeRoom)
  const posts      = postsByRoom[activeRoom] || []
  const roomAlerts = modAlerts.filter(a => a.roomId === activeRoom)

  // Block access to aether room if not a holder
  const aetherBlocked = room.gated && !isAetherHolder

  function handlePost(text, media) {
    if (aetherBlocked) return
    const fp = Math.random().toString(36).slice(2,6) + '·' + Math.random().toString(36).slice(2,6)
    const violation = text ? scanPost(text, activeRoom) : null
    const newPost = { id: Date.now().toString(), fingerprint: fp, text, media, flagged: !!violation }
    setPostsByRoom(prev => ({ ...prev, [activeRoom]: [newPost, ...(prev[activeRoom] || [])] }))
    if (violation) {
      const msg = (MOD_RESPONSES[activeRoom] || MOD_RESPONSES.general)(violation)
      setModAlerts(prev => [...prev, { id: Date.now().toString(), roomId: activeRoom, message: msg }])
      setModLog(prev => [...prev, { action: 'warn', fp, reason: `Auto-flagged: "${violation}"`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), roomId: activeRoom }])
    }
  }

  function handleModAction(postId, action) {
    const post = posts.find(p => p.id === postId)
    if (!post) return
    if (action === 'remove') {
      setPostsByRoom(prev => ({ ...prev, [activeRoom]: prev[activeRoom].map(p => p.id === postId ? { ...p, removed: true } : p) }))
    } else {
      setPostsByRoom(prev => ({ ...prev, [activeRoom]: prev[activeRoom].map(p => p.id === postId ? { ...p, flagged: true } : p) }))
    }
    setModLog(prev => [...prev, { action, fp: post.fingerprint, reason: 'Manual action', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), roomId: activeRoom }])
  }

  const ChannelList = () => (
    <>
      <p style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: 2, padding: '0 16px', marginBottom: 10 }}>CHANNELS</p>
      {ROOMS.map(r => {
        const locked = r.gated && !isAetherHolder
        return (
          <button key={r.id} onClick={() => { setActiveRoom(r.id); setDrawerOpen(false) }}
            style={{ width: '100%', textAlign: 'left', padding: '9px 16px', background: activeRoom === r.id ? `${r.color}12` : 'transparent', border: 'none', borderLeft: `2px solid ${activeRoom === r.id ? r.color : 'transparent'}`, cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={e => { if (activeRoom !== r.id) e.currentTarget.style.background = `${r.color}08` }}
            onMouseLeave={e => { if (activeRoom !== r.id) e.currentTarget.style.background = 'transparent' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <RoomIcon id={r.id} color={activeRoom === r.id ? r.color : 'rgba(255,255,255,0.3)'} size={13} />
              <span style={{ fontFamily: 'monospace', fontSize: 12, color: activeRoom === r.id ? r.color : 'rgba(255,255,255,0.4)' }}>{r.label}</span>
              {locked && <IconLock color="rgba(255,215,0,0.4)" size={11} />}
              {r.gated && !locked && <span style={{ fontSize: 8, color: '#ffd700', border: '1px solid rgba(255,215,0,0.3)', padding: '1px 5px', borderRadius: 4, fontFamily: 'monospace', marginLeft: 'auto' }}>HOLDER</span>}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.18)', marginTop: 3, paddingLeft: 21 }}>{r.desc}</div>
          </button>
        )
      })}
    </>
  )

  const RightPanelContent = () => (
    <>
      <p style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: 2, marginBottom: 10 }}>TOOLS</p>
      {TOOLS.map(t => (
        <button key={t.id} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', marginBottom: 4, background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, color: 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'monospace' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = `${room.color}50`; e.currentTarget.style.color = room.color }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
        >{t.label}</button>
      ))}
      <p style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: 2, margin: '20px 0 10px' }}>ALL ROOMS</p>
      {ROOMS.map(r => (
        <div key={r.id} onClick={() => { setActiveRoom(r.id); setSideOpen(false) }}
          style={{ padding: '7px 10px', marginBottom: 3, borderRadius: 8, cursor: 'pointer', background: activeRoom === r.id ? `${r.color}12` : 'transparent', borderLeft: `2px solid ${activeRoom === r.id ? r.color : 'transparent'}`, display: 'flex', alignItems: 'center', gap: 8, transition: 'background 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = `${r.color}0e` }}
          onMouseLeave={e => { e.currentTarget.style.background = activeRoom === r.id ? `${r.color}12` : 'transparent' }}
        >
          <RoomIcon id={r.id} color={activeRoom === r.id ? r.color : 'rgba(255,255,255,0.28)'} size={12} />
          <span style={{ fontFamily: 'monospace', fontSize: 11, color: activeRoom === r.id ? r.color : 'rgba(255,255,255,0.38)' }}>{r.label}</span>
          {r.gated && !isAetherHolder && <IconLock color="rgba(255,215,0,0.35)" size={10} />}
          {r.gated && isAetherHolder && <span style={{ fontSize: 7, color: '#ffd700', border: '1px solid rgba(255,215,0,0.25)', padding: '1px 4px', borderRadius: 3, fontFamily: 'monospace', marginLeft: 'auto' }}>HOLDER</span>}
        </div>
      ))}
      {isMod && <ModLog log={modLog.filter(e => e.roomId === activeRoom)} />}
    </>
  )

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#07060f', color: '#f1f1f7', overflow: 'hidden' }}>
      {drawerOpen && <div onClick={() => setDrawerOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 299 }} />}
      {sideOpen   && <div onClick={() => setSideOpen(false)}   style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 299 }} />}

      <aside style={{ width: 190, background: '#07060f', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '20px 0', flexShrink: 0, overflowY: 'auto', ...(typeof window !== 'undefined' && window.innerWidth <= 768 ? { position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 300, transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.22s ease' } : {}) }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px 12px' }}>
          <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: 2 }}>CONDUIT</span>
          <button onClick={() => setDrawerOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><IconClose color="rgba(255,255,255,0.2)" /></button>
        </div>
        <ChannelList />
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: room.bg, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: `1px solid ${room.color}22`, background: '#07060f' }}>
          <button onClick={() => setDrawerOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}><IconMenu color="rgba(255,255,255,0.4)" /></button>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <RoomIcon id={room.id} color={room.color} size={15} />
            <span style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 700, color: room.color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{room.label}</span>
            {room.gated && isAetherHolder && <span style={{ fontSize: 8, color: '#ffd700', border: '1px solid rgba(255,215,0,0.3)', padding: '1px 6px', borderRadius: 20, fontFamily: 'monospace', letterSpacing: 1, flexShrink: 0 }}>HOLDER ⚡</span>}
            {room.gated && !isAetherHolder && <span style={{ fontSize: 8, color: 'rgba(255,215,0,0.4)', border: '1px solid rgba(255,215,0,0.15)', padding: '1px 6px', borderRadius: 20, fontFamily: 'monospace', letterSpacing: 1, flexShrink: 0 }}>AETH GATED</span>}
          </div>
          {isAdmin && <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, background: 'rgba(255,60,60,0.1)', border: '1px solid rgba(255,60,60,0.25)', flexShrink: 0 }}><IconShield color="#ff6666" size={10} /><span style={{ fontFamily: 'monospace', fontSize: 9, color: '#ff6666', fontWeight: 700, letterSpacing: 1 }}>ADMIN</span></div>}
          {!isAdmin && isMod && <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, background: 'rgba(255,200,0,0.08)', border: '1px solid rgba(255,200,0,0.2)', flexShrink: 0 }}><IconShield color="#ffcc00" size={10} /><span style={{ fontFamily: 'monospace', fontSize: 9, color: '#ffcc00', fontWeight: 700, letterSpacing: 1 }}>MOD</span></div>}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: room.color, fontFamily: 'monospace' }}>{room.ai.name}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>{posts.filter(p => !p.removed).length} signals</div>
            </div>
            <button onClick={() => setSideOpen(s => !s)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, cursor: 'pointer', padding: '4px 8px', fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>···</button>
          </div>
        </div>

        <div style={{ padding: '4px 14px', borderBottom: `1px solid ${room.color}10` }}>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontStyle: 'italic', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{room.vibe}</p>
        </div>

        <main style={{ flex: 1, overflowY: 'auto', padding: '16px 14px' }}>
          {aetherBlocked ? <AetherGateWall /> : (
            <>
              <AIGreeter room={room} key={room.id} />
              {roomAlerts.map(a => <ModAlert key={a.id} room={room} message={a.message} onDismiss={() => setModAlerts(prev => prev.filter(x => x.id !== a.id))} />)}
              <PostBox onPost={handlePost} room={room} />
              {posts.length === 0 ? (
                <div style={{ textAlign: 'center', opacity: 0.3, marginTop: '3rem' }}>
                  <p style={{ fontFamily: 'monospace', color: room.color, fontSize: 13 }}>No signals in {room.label} yet</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 6 }}>{room.vibe}</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {posts.map(p => <PostCard key={p.id} post={p} room={room} isMod={isMod} onRemove={handleModAction} />)}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <aside style={{ width: 210, background: '#07060f', borderLeft: '1px solid rgba(255,255,255,0.05)', padding: '20px 14px', flexShrink: 0, overflowY: 'auto', ...(typeof window !== 'undefined' && window.innerWidth <= 768 ? { position: 'fixed', top: 0, right: 0, height: '100vh', zIndex: 300, transform: sideOpen ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.22s ease' } : {}) }}>
        <RightPanelContent />
      </aside>
    </div>
  )
}
