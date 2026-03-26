import React, { useState } from 'react'

const EMOJIS = ['🔥','⚡','👁️','💀','🛸','💬','🚀','👾']

export default function ReactionsBar({ reactions = {}, onReact, color = '#7c3aed' }) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const total = Object.values(reactions).reduce((a,b) => a+b, 0)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', position: 'relative' }}>
      {/* Existing reactions */}
      {Object.entries(reactions).map(([emoji, count]) => (
        <button key={emoji} onClick={() => onReact(emoji)}
          style={{
            padding: '2px 8px', borderRadius: 20, fontSize: 12,
            background: `${color}15`,
            border: `1px solid ${color}30`,
            color: '#e2e8f0', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4,
            transition: 'all 0.12s',
            fontFamily: 'monospace',
          }}
          onMouseEnter={e => e.currentTarget.style.background = `${color}30`}
          onMouseLeave={e => e.currentTarget.style.background = `${color}15`}
        >
          <span>{emoji}</span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{count}</span>
        </button>
      ))}

      {/* Add reaction button */}
      <button onClick={() => setPickerOpen(o => !o)} style={{
        padding: '2px 8px', borderRadius: 20, fontSize: 12,
        background: 'transparent',
        border: '1px solid rgba(255,255,255,0.08)',
        color: 'rgba(255,255,255,0.3)', cursor: 'pointer',
      }}>＋</button>

      {/* Mini picker */}
      {pickerOpen && (
        <div style={{
          position: 'absolute', bottom: '100%', left: 0, marginBottom: 6,
          background: '#1e1c30', border: '1px solid #3b3560',
          borderRadius: 12, padding: 10,
          display: 'flex', gap: 6, flexWrap: 'wrap',
          zIndex: 50, maxWidth: 200, boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }}>
          {EMOJIS.map(e => (
            <button key={e} onClick={() => { onReact(e); setPickerOpen(false) }}
              style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', padding: 2, borderRadius: 6, transition: 'transform 0.1s' }}
              onMouseEnter={el => el.currentTarget.style.transform = 'scale(1.3)'}
              onMouseLeave={el => el.currentTarget.style.transform = 'scale(1)'}
            >{e}</button>
          ))}
        </div>
      )}
    </div>
  )
}
