import React, { useState } from 'react'

const TOOLS = [
  { icon: '⊞', label: 'Terminal',  hint: 'Encrypted CLI',    action: 'terminal' },
  { icon: '📝', label: 'Code Share', hint: 'E2E snippets',    action: 'code' },
  { icon: '🔐', label: 'Vault',      hint: 'Encrypted files', action: 'vault' },
  { icon: '🌐', label: 'Mesh',       hint: 'P2P bridge',       action: 'mesh' },
]

export default function ToolsPanel({ onToolSelect }) {
  const [active, setActive] = useState(null)

  function handleClick(tool) {
    setActive(tool.action)
    if (onToolSelect) onToolSelect(tool)
  }

  return (
    <div className="flex flex-col flex-shrink-0 overflow-hidden"
      style={{ width: 200, background: '#0f0e1f', borderRight: '1px solid #1e1e2e' }}>
      <div className="px-4 py-3" style={{ borderBottom: '1px solid #1e1e2e' }}>
        <p className="text-xs font-semibold" style={{ color: '#d4d4d8' }}>Tools</p>
        <p className="text-xs mt-0.5" style={{ color: '#52525b' }}>Encrypted utilities</p>
      </div>
      <div className="flex flex-col gap-1 p-2">
        {TOOLS.map(t => (
          <button key={t.label}
            onClick={() => handleClick(t)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left w-full transition-all"
            style={{
              background: active === t.action ? 'rgba(124,58,237,0.15)' : 'transparent',
              border: `1px solid ${active === t.action ? 'rgba(124,58,237,0.35)' : 'transparent'}`,
              cursor: 'pointer',
              color: active === t.action ? '#a78bfa' : '#52525b',
            }}
            onMouseOver={e => {
              if (active !== t.action) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                e.currentTarget.style.borderColor = '#1e1e2e'
                e.currentTarget.style.color = '#d4d4d8'
              }
            }}
            onMouseOut={e => {
              if (active !== t.action) {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderColor = 'transparent'
                e.currentTarget.style.color = '#52525b'
              }
            }}
          >
            <span className="text-base">{t.icon}</span>
            <div>
              <p className="text-xs font-medium" style={{ color: 'inherit' }}>{t.label}</p>
              <p className="text-xs" style={{ color: '#3f3f46' }}>{t.hint}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
