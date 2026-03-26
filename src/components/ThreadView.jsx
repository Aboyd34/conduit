import React, { useState } from 'react'
import { Avatar } from './UserProfile.jsx'

export default function ThreadView({ post, room, onClose, currentUser, isMod, onModAction }) {
  const [replies, setReplies]   = useState([])
  const [replyText, setReplyText] = useState('')

  function submitReply() {
    if (!replyText.trim()) return
    const fp = Math.random().toString(36).slice(2,6) + '·' + Math.random().toString(36).slice(2,6)
    setReplies(prev => [...prev, {
      id: Date.now().toString(),
      fingerprint: fp,
      text: replyText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }])
    setReplyText('')
  }

  if (!post) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 400,
      background: 'rgba(7,6,15,0.92)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'linear-gradient(135deg,#0f0e1a,#16142a)',
        border: `1px solid ${room.color}30`,
        borderRadius: 16, padding: '24px 22px',
        width: '100%', maxWidth: 540, maxHeight: '85vh',
        display: 'flex', flexDirection: 'column', gap: 14,
        boxShadow: `0 24px 64px ${room.color}18`,
        overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'monospace', fontSize: 10, color: room.color, letterSpacing: 2 }}>THREAD</span>
            <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>{room.label}</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
        </div>

        {/* Original post */}
        <div style={{ background: `${room.color}08`, border: `1px solid ${room.color}25`, borderRadius: 12, padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Avatar fingerprint={post.fingerprint} handle={post.fingerprint} size={28} />
            <span style={{ fontFamily: 'monospace', fontSize: 10, color: `${room.color}90`, letterSpacing: 1 }}>{post.fingerprint}</span>
            <span style={{ marginLeft: 'auto', fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>OP</span>
          </div>
          <p style={{ fontSize: 14, color: '#e8e8f2', lineHeight: 1.65, margin: 0 }}>{post.text}</p>
        </div>

        {/* Replies */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {replies.length === 0 && (
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', textAlign: 'center', padding: '12px 0' }}>No replies yet. Start the thread.</p>
          )}
          {replies.map(r => (
            <div key={r.id} style={{ display: 'flex', gap: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
              <Avatar fingerprint={r.fingerprint} handle={r.fingerprint} size={26} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: 1 }}>{r.fingerprint}</span>
                  <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>{r.time}</span>
                </div>
                <p style={{ fontSize: 13, color: '#e0e0f0', lineHeight: 1.6, margin: 0 }}>{r.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Reply box */}
        <div style={{ display: 'flex', gap: 8, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 12 }}>
          <Avatar fingerprint={currentUser?.fingerprint || 'anon'} handle={currentUser?.fingerprint} size={30} />
          <div style={{ flex: 1, display: 'flex', gap: 8 }}>
            <input
              value={replyText} onChange={e => setReplyText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitReply()}
              placeholder={`Reply in ${room.label}…`}
              style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: `1px solid ${room.color}25`, borderRadius: 8, padding: '8px 12px', color: '#f1f1f7', fontSize: 13, outline: 'none', fontFamily: 'monospace' }}
            />
            <button onClick={submitReply} disabled={!replyText.trim()} style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: replyText.trim() ? room.color : 'rgba(255,255,255,0.06)', color: replyText.trim() ? '#07060f' : 'rgba(255,255,255,0.2)', fontSize: 11, fontWeight: 700, cursor: replyText.trim() ? 'pointer' : 'default', fontFamily: 'monospace' }}>REPLY</button>
          </div>
        </div>

        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.15)', fontFamily: 'monospace', textAlign: 'center', margin: 0 }}>
          {replies.length} repl{replies.length !== 1 ? 'ies' : 'y'}
        </p>
      </div>
    </div>
  )
}
