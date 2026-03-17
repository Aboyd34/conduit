const TOOLS = [
  { icon: '⊞', label: 'Terminal',  hint: 'Encrypted CLI' },
  { icon: '📝', label: 'Code Share', hint: 'E2E snippets' },
  { icon: '🔐', label: 'Vault',      hint: 'Encrypted files' },
  { icon: '🌐', label: 'Mesh',       hint: 'P2P bridge' },
]

export default function ToolsPanel() {
  return (
    <div className="flex flex-col flex-shrink-0 overflow-hidden"
      style={{ width: 200, background: '#0f0e1f', borderRight: '1px solid #1e1e2e' }}>
      <div className="px-4 py-3" style={{ borderBottom: '1px solid #1e1e2e' }}>
        <p className="text-xs font-semibold">Tools</p>
        <p className="text-xs mt-0.5" style={{ color: '#52525b' }}>Encrypted utilities</p>
      </div>
      <div className="flex flex-col gap-1 p-2">
        {TOOLS.map(t => (
          <button key={t.label}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left w-full transition-all"
            style={{ background: 'transparent', border: '1px solid transparent', cursor: 'pointer', color: '#52525b' }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = '#1e1e2e'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
          >
            <span className="text-base">{t.icon}</span>
            <div>
              <p className="text-xs font-medium" style={{ color: '#d4d4d8' }}>{t.label}</p>
              <p className="text-xs" style={{ color: '#3f3f46' }}>{t.hint}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
