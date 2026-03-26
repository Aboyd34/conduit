import React, { useState, useRef } from 'react'
import ReactionsBar from './ReactionsBar.jsx'

const ROOM_COLORS = { general:'#5b8cff', dev:'#9b5cff', privacy:'#00ffc3', aether:'#ffd700', random:'#ff6b6b' }

function Reply({ reply, color }) {
  return (
    <div style={{ display: 'flex', gap: 10, paddingLeft: 16, borderLeft: `2px solid ${color}30` }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'monospace', fontSize: 10, color: `${color}90`, marginBottom: 5 }}>{reply.fingerprint}</div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, margin: 0 }}>{reply.text}</p>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 4, fontFamily: 'monospace' }}>
          {new Date(reply.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  )
}

export default function ThreadView({ post, roomId, myFp, onClose, onReact }) {
  const color = ROOM_COLORS[roomId] || '#7c3aed'
  const [replies, setReplies] = useState(post.replies || [])
  const [text, setText]       = useState('')
  const inputRef              = useRef()

  function submitReply() {
    if (!text.trim()) return
    const r = {
      id: Date.now().toString(),
      fingerprint: myFp || 'anon',
      text: text.trim(),
      ts: Date.now(),
    }
    setReplies(prev => [...prev, r])
    setText('')
    inputRef.current?.focus()
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 700 }} />

      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 701,
        background: '#0a0916', borderTop: '1px solid #2d2a4a',
        borderRadius: '20px 20px 0 0', maxHeight: '85vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.7)',
        animation: 'slideUp 0.25s ease',
      }}>
        {/* Handle */}
        <div style={{ padding: '14px 20px 0', flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.1)', margin: '0 auto 16px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontFamily: 'monospace', fontSize: 10, color: color, letterSpacing: 2 }}>THREAD · #{roomId}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 18, cursor: 'pointer' }}>×</button>
          </div>

          {/* Original post */}
          <div style={{ background: '#0f0e1a', border: `1px solid ${color}30`, borderRadius: 12, padding: '12px 14px', marginBottom: 16 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 10, color: `${color}90`, marginBottom: 6 }}>{post.fingerprint}</div>
            <p style={{ fontSize: 14, color: '#e2e8f0', lineHeight: 1.65, margin: '0 0 10px' }}>{post.text}</p>
            <ReactionsBar reactions={post.reactions} onReact={e => onReact && onReact(roomId, post.id, e)} color={color} />
          </div>
        </div>

        {/* Replies scroll area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {replies.length === 0 && (
            <div style={{ textAlign: 'center', opacity: 0.3, padding: '30px 0' }}>
              <p style={{ fontFamily: 'monospace', fontSize: 12 }}>No replies yet. Start the thread.</p>
            </div>
          )}
          {replies.map(r => <Reply key={r.id} reply={r} color={color} />)}
        </div>

        {/* Reply input */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 8, flexShrink: 0 }}>
          <input
            ref={inputRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submitReply()}
            placeholder="Reply to this signal…"
            style={{ flex: 1, background: '#1e1c30', border: `1px solid ${color}30`, borderRadius: 8, padding: '9px 12px', color: '#e2e8f0', fontSize: 13, outline: 'none', fontFamily: 'monospace' }}
          />
          <button onClick={submitReply} disabled={!text.trim()} style={{ padding: '9px 16px', borderRadius: 8, border: 'none', background: text.trim() ? color : 'rgba(255,255,255,0.06)', color: text.trim() ? '#07060f' : 'rgba(255,255,255,0.2)', fontWeight: 700, fontSize: 13, cursor: text.trim() ? 'pointer' : 'default', fontFamily: 'monospace' }}>↑</button>
        </div>
      </div>

      <style>{`@keyframes slideUp { from { transform:translateY(60px);opacity:0 } to { transform:translateY(0);opacity:1 } }`}</style>
    </>
  )
}
