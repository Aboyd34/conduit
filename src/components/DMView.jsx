import React, { useState, useRef, useEffect } from 'react'
import { getProfile } from './UserProfile.jsx'

const DM_KEY = (a, b) => {
  const sorted = [a, b].sort()
  return `conduit_dm_${sorted[0]}_${sorted[1]}`
}

function loadDMs(a, b) {
  try { return JSON.parse(localStorage.getItem(DM_KEY(a, b)) || '[]') } catch { return [] }
}
function saveDMs(a, b, msgs) {
  try { localStorage.setItem(DM_KEY(a, b), JSON.stringify(msgs)) } catch {}
}

export default function DMView({ targetFp, myFp, onClose }) {
  const [messages, setMessages] = useState(() => loadDMs(myFp, targetFp))
  const [text, setText]         = useState('')
  const [ephemeral, setEphemeral] = useState(false)
  const bottomRef               = useRef()

  const targetProfile = getProfile(targetFp) || {}
  const targetHandle  = targetProfile.handle || targetFp?.slice(0,10) + '…'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function send() {
    if (!text.trim()) return
    const msg = {
      id: Date.now().toString(),
      from: myFp,
      text: text.trim(),
      ts: Date.now(),
      ephemeral,
    }
    const updated = [...messages, msg]
    setMessages(updated)
    if (!ephemeral) saveDMs(myFp, targetFp, updated)
    setText('')
  }

  function clearAll() {
    setMessages([])
    localStorage.removeItem(DM_KEY(myFp, targetFp))
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 700 }} />

      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 701,
        background: '#0a0916', borderTop: '1px solid #2d2a4a',
        borderRadius: '20px 20px 0 0', height: '75vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.7)',
        animation: 'slideUp 0.25s ease',
      }}>
        {/* Header */}
        <div style={{ padding: '14px 18px 12px', borderBottom: '1px solid #1e1c30', flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.1)', margin: '0 auto 14px' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff' }}>
                {targetHandle[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>{targetHandle}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>Direct Signal · Encrypted locally</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {messages.length > 0 && (
                <button onClick={clearAll} style={{ fontSize: 10, color: 'rgba(255,100,100,0.5)', background: 'none', border: '1px solid rgba(255,100,100,0.2)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontFamily: 'monospace' }}>Clear</button>
              )}
              <button onClick={onClose} style={{ fontSize: 18, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>×</button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', opacity: 0.25, padding: '40px 0' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>✉️</div>
              <p style={{ fontFamily: 'monospace', fontSize: 12 }}>No messages yet. Send the first signal.</p>
            </div>
          )}
          {messages.map(msg => {
            const isMine = msg.from === myFp
            return (
              <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '75%', padding: '9px 13px', borderRadius: isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: isMine ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : '#1e1c30',
                  color: '#e2e8f0', fontSize: 13, lineHeight: 1.55,
                  border: msg.ephemeral ? '1px dashed rgba(255,255,255,0.15)' : 'none',
                }}>
                  {msg.text}
                  {msg.ephemeral && <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginLeft: 6, fontFamily: 'monospace' }}>ephemeral</span>}
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {/* Ephemeral toggle + input */}
        <div style={{ padding: '10px 14px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <button onClick={() => setEphemeral(e => !e)} style={{
              fontSize: 10, fontFamily: 'monospace', padding: '4px 10px', borderRadius: 6,
              background: ephemeral ? 'rgba(255,100,100,0.1)' : 'transparent',
              border: `1px solid ${ephemeral ? 'rgba(255,100,100,0.3)' : 'rgba(255,255,255,0.1)'}`,
              color: ephemeral ? '#ff8888' : 'rgba(255,255,255,0.3)', cursor: 'pointer',
            }}>🔥 {ephemeral ? 'Ephemeral ON' : 'Ephemeral OFF'}</button>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>Ephemeral messages are never saved.</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder={`Signal ${targetHandle}…`}
              style={{ flex: 1, background: '#1e1c30', border: '1px solid #3b3560', borderRadius: 8, padding: '10px 13px', color: '#e2e8f0', fontSize: 13, outline: 'none', fontFamily: 'monospace' }}
            />
            <button onClick={send} disabled={!text.trim()} style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: text.trim() ? '#7c3aed' : 'rgba(255,255,255,0.06)', color: text.trim() ? '#fff' : 'rgba(255,255,255,0.2)', fontWeight: 700, fontSize: 13, cursor: text.trim() ? 'pointer' : 'default', fontFamily: 'monospace' }}>↑</button>
          </div>
        </div>
      </div>

      <style>{`@keyframes slideUp { from{transform:translateY(60px);opacity:0} to{transform:translateY(0);opacity:1} }`}</style>
    </>
  )
}
