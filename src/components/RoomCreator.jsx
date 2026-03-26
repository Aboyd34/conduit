import React, { useState } from 'react'

const ROOM_COLORS = [
  '#5b8cff','#9b5cff','#00ffc3','#ff6b6b','#ffd700',
  '#f97316','#ec4899','#22d3ee','#84cc16','#e879f9',
]

export default function RoomCreator({ onSubmit, onClose, isAdmin }) {
  const [name, setName]       = useState('')
  const [topic, setTopic]     = useState('')
  const [color, setColor]     = useState(ROOM_COLORS[0])
  const [gated, setGated]     = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const cleanName = name.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 20)

  function handleSubmit() {
    if (!cleanName || !topic.trim()) return
    const room = { id: `custom_${cleanName}`, label: `#${cleanName}`, desc: topic.trim(), color, gated, pending: !isAdmin }
    onSubmit(room)
    setSubmitted(true)
    setTimeout(() => onClose(), 1800)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#0f0e1a', border: '1px solid #2d2a4a', borderRadius: 18, padding: '28px 24px', width: '100%', maxWidth: 420, color: '#e2e8f0' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <div>
            <h2 style={{ fontFamily: 'monospace', fontSize: 16, margin: 0, fontWeight: 800 }}>Create a Room</h2>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: '4px 0 0', fontFamily: 'monospace' }}>
              {isAdmin ? 'Rooms you create go live immediately.' : 'Your proposal will be reviewed by admin.'}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 20, cursor: 'pointer' }}>×</button>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>{isAdmin ? '✅' : '📡'}</div>
            <p style={{ fontFamily: 'monospace', fontSize: 14, color: '#a78bfa' }}>
              {isAdmin ? `#${cleanName} is live!` : 'Proposal submitted. Admin will review it.'}
            </p>
          </div>
        ) : (
          <>
            {/* Name */}
            <label style={{ fontSize: 11, color: '#a78bfa', fontFamily: 'monospace' }}>Room Name</label>
            <div style={{ position: 'relative', marginBottom: 14, marginTop: 4 }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', fontSize: 14 }}>#</span>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="room-name"
                style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px 9px 24px', background: '#1e1c30', border: '1px solid #3b3560', borderRadius: 8, color: '#e2e8f0', fontSize: 13, outline: 'none', fontFamily: 'monospace' }} />
              {cleanName && <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>#{cleanName}</span>}
            </div>

            {/* Topic */}
            <label style={{ fontSize: 11, color: '#a78bfa', fontFamily: 'monospace' }}>Topic / Description</label>
            <input value={topic} onChange={e => setTopic(e.target.value.slice(0, 80))} placeholder="What signals flow here?"
              style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', background: '#1e1c30', border: '1px solid #3b3560', borderRadius: 8, color: '#e2e8f0', fontSize: 13, outline: 'none', fontFamily: 'monospace', marginTop: 4, marginBottom: 14 }} />

            {/* Color */}
            <label style={{ fontSize: 11, color: '#a78bfa', fontFamily: 'monospace', display: 'block', marginBottom: 8 }}>Room Color</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {ROOM_COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)} style={{ width: 26, height: 26, borderRadius: '50%', background: c, border: color === c ? '2px solid #fff' : '2px solid transparent', cursor: 'pointer', boxSizing: 'border-box' }} />
              ))}
            </div>

            {/* Preview */}
            <div style={{ background: `${color}10`, border: `1px solid ${color}30`, borderRadius: 10, padding: '10px 14px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: 'monospace', fontSize: 14, color, fontWeight: 700 }}>#{cleanName || 'room-name'}</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{topic || 'Your topic here'}</span>
            </div>

            {/* AETH gate toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, padding: '10px 12px', background: 'rgba(255,215,0,0.04)', border: '1px solid rgba(255,215,0,0.15)', borderRadius: 10 }}>
              <div>
                <div style={{ fontSize: 12, color: '#ffd700', fontFamily: 'monospace' }}>⚡ AETH Gated</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>Require token holders only</div>
              </div>
              <button onClick={() => setGated(g => !g)} style={{ width: 40, height: 22, borderRadius: 11, background: gated ? '#7c3aed' : 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: gated ? 21 : 3, transition: 'left 0.2s' }} />
              </button>
            </div>

            <button onClick={handleSubmit} disabled={!cleanName || !topic.trim()} style={{
              width: '100%', padding: '12px', borderRadius: 10, border: 'none',
              background: cleanName && topic.trim() ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : 'rgba(255,255,255,0.06)',
              color: cleanName && topic.trim() ? '#fff' : 'rgba(255,255,255,0.2)',
              fontWeight: 800, fontSize: 14, cursor: cleanName && topic.trim() ? 'pointer' : 'default',
              fontFamily: 'monospace', letterSpacing: 1,
            }}>{ isAdmin ? 'Create Room →' : 'Submit Proposal →' }</button>
          </>
        )}
      </div>
    </div>
  )
}
