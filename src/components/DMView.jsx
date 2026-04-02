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
  const [text, setText] = useState('')
  const [ephemeral, setEphemeral] = useState(false)
  const bottomRef = useRef()

  const targetProfile = getProfile(targetFp) || {}
  const targetHandle = targetProfile.handle || targetFp?.slice(0, 10) + '…'

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
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="dm-backdrop"
      />

      {/* Drawer */}
      <div className="dm-panel">

        {/* Header */}
        <div className="dm-header">
          <div className="dm-grabber" />

          <div className="dm-header-row">
            <div className="dm-avatar">
              {targetHandle[0]?.toUpperCase()}
            </div>

            <div className="dm-meta">
              <div className="dm-handle">{targetHandle}</div>
              <div className="dm-sub">Direct Signal · Encrypted locally</div>
            </div>

            <div className="dm-actions">
              {messages.length > 0 && (
                <button className="dm-clear" onClick={clearAll}>Clear</button>
              )}
              <button className="dm-close" onClick={onClose}>×</button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="dm-body">
          {messages.length === 0 && (
            <div className="dm-empty">
              <div className="dm-empty-icon">✉️</div>
              <p>No messages yet. Send the first signal.</p>
            </div>
          )}

          {messages.map(msg => {
            const isMine = msg.from === myFp
            return (
              <div key={msg.id} className={`dm-row ${isMine ? 'mine' : 'theirs'}`}>
                <div className={`dm-bubble ${msg.ephemeral ? 'ephemeral' : ''}`}>
                  {msg.text}
                  {msg.ephemeral && <span className="dm-ephemeral-tag">ephemeral</span>}
                </div>
              </div>
            )
          })}

          <div ref={bottomRef} />
        </div>

        {/* Composer */}
        <div className="dm-composer">
          <div className="dm-ephemeral-toggle">
            <button
              className={`dm-ephemeral-btn ${ephemeral ? 'on' : ''}`}
              onClick={() => setEphemeral(e => !e)}
            >
              🔥 {ephemeral ? 'Ephemeral ON' : 'Ephemeral OFF'}
            </button>
            <span className="dm-ephemeral-note">Ephemeral messages are never saved.</span>
          </div>

          <div className="dm-input-row">
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder={`Signal ${targetHandle}…`}
              className="dm-input"
            />
            <button
              onClick={send}
              disabled={!text.trim()}
              className={`dm-send ${text.trim() ? 'active' : ''}`}
            >
              ↑
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
