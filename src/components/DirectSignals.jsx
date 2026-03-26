import React, { useState, useRef, useEffect } from 'react'
import { Avatar } from './UserProfile.jsx'

const DM_KEY = 'conduit_dms'

function loadDMs() { return JSON.parse(localStorage.getItem(DM_KEY) || '{}') }
function saveDMs(dms) { localStorage.setItem(DM_KEY, JSON.stringify(dms)) }
function threadId(a, b) { return [a, b].sort().join('::') }

export default function DirectSignals({ currentUser, onClose }) {
  const [dms, setDms]               = useState(loadDMs)
  const [activeThread, setActive]   = useState(null)
  const [newFp, setNewFp]           = useState('')
  const [message, setMessage]       = useState('')
  const [composing, setComposing]   = useState(false)
  const bottomRef = useRef()

  const myFp = currentUser?.fingerprint || 'anon'

  const threads = Object.entries(dms).filter(([id]) => id.includes(myFp))

  function getMessages(tid) { return dms[tid] || [] }

  function sendMessage() {
    if (!message.trim() || !activeThread) return
    const tid = activeThread
    const msg = {
      id: Date.now().toString(),
      from: myFp,
      text: message.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      encrypted: true,
    }
    const updated = { ...dms, [tid]: [...(dms[tid] || []), msg] }
    setDms(updated)
    saveDMs(updated)
    setMessage('')
  }

  function startNewThread() {
    const fp = newFp.trim()
    if (!fp || fp === myFp) return
    const tid = threadId(myFp, fp)
    if (!dms[tid]) {
      const updated = { ...dms, [tid]: [] }
      setDms(updated)
      saveDMs(updated)
    }
    setActive(tid)
    setComposing(false)
    setNewFp('')
  }

  function otherFp(tid) { return tid.split('::').find(f => f !== myFp) || 'unknown' }

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [activeThread, dms])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(7,6,15,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'linear-gradient(135deg,#0f0e1a,#16142a)', border: '1px solid #2d2a4a', borderRadius: 16, width: '100%', maxWidth: 600, height: '80vh', display: 'flex', overflow: 'hidden', boxShadow: '0 24px 64px rgba(124,58,237,0.2)' }}>

        {/* Thread list */}
        <div style={{ width: 200, borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '16px 14px 10px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: 2 }}>DIRECT SIGNALS</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 16 }}>×</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
            {threads.length === 0 && !composing && (
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', textAlign: 'center', padding: '20px 14px' }}>No signals yet</p>
            )}
            {threads.map(([tid]) => (
              <button key={tid} onClick={() => setActive(tid)} style={{ width: '100%', textAlign: 'left', padding: '10px 14px', background: activeThread === tid ? 'rgba(124,58,237,0.12)' : 'transparent', border: 'none', borderLeft: `2px solid ${activeThread === tid ? '#7c3aed' : 'transparent'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar fingerprint={otherFp(tid)} handle={otherFp(tid)} size={28} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'monospace', fontSize: 10, color: activeThread === tid ? '#a78bfa' : 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{otherFp(tid)}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>{getMessages(tid).length} msgs</div>
                </div>
              </button>
            ))}
          </div>
          <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <button onClick={() => setComposing(true)} style={{ width: '100%', padding: '8px', borderRadius: 8, border: '1px solid rgba(124,58,237,0.3)', background: 'rgba(124,58,237,0.08)', color: '#a78bfa', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace' }}>+ New Signal</button>
          </div>
        </div>

        {/* Message area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {composing ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 }}>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', margin: 0 }}>Enter target fingerprint</p>
              <input value={newFp} onChange={e => setNewFp(e.target.value)} onKeyDown={e => e.key === 'Enter' && startNewThread()}
                placeholder="e.g. a3f9·bc12"
                style={{ width: '100%', maxWidth: 280, padding: '10px 14px', borderRadius: 8, background: '#1e1c30', border: '1px solid #3b3560', color: '#e2e8f0', fontSize: 14, outline: 'none', fontFamily: 'monospace', textAlign: 'center' }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={startNewThread} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'monospace' }}>Open Signal</button>
                <button onClick={() => setComposing(false)} style={{ padding: '9px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace' }}>Cancel</button>
              </div>
            </div>
          ) : activeThread ? (
            <>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar fingerprint={otherFp(activeThread)} handle={otherFp(activeThread)} size={30} />
                <div>
                  <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: 1 }}>{otherFp(activeThread)}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>🔒 end-to-end encrypted</div>
                </div>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {getMessages(activeThread).length === 0 && (
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', textAlign: 'center', marginTop: 40 }}>Send the first signal…</p>
                )}
                {getMessages(activeThread).map(msg => (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: msg.from === myFp ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '75%', padding: '9px 13px', borderRadius: msg.from === myFp ? '12px 12px 3px 12px' : '12px 12px 12px 3px', background: msg.from === myFp ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.05)', border: `1px solid ${msg.from === myFp ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.07)'}` }}>
                      <p style={{ fontSize: 13, color: '#e2e8f0', margin: 0, lineHeight: 1.5 }}>{msg.text}</p>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', marginTop: 4, textAlign: msg.from === myFp ? 'right' : 'left' }}>{msg.time}</div>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 8 }}>
                <input value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder="Send a signal…"
                  style={{ flex: 1, padding: '9px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(124,58,237,0.2)', color: '#f1f1f7', fontSize: 13, outline: 'none', fontFamily: 'monospace' }} />
                <button onClick={sendMessage} disabled={!message.trim()} style={{ padding: '9px 14px', borderRadius: 8, border: 'none', background: message.trim() ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : 'rgba(255,255,255,0.06)', color: message.trim() ? '#fff' : 'rgba(255,255,255,0.2)', fontWeight: 700, fontSize: 11, cursor: message.trim() ? 'pointer' : 'default', fontFamily: 'monospace' }}>SEND</button>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, opacity: 0.3 }}>
              <div style={{ fontSize: 28 }}>📡</div>
              <p style={{ fontFamily: 'monospace', fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>Select a thread or start a new signal</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
