const ITEMS = [
  { id: 'rooms',  icon: '⚡', label: 'Rooms' },
  { id: 'pulse',  icon: '📡', label: 'Pulse' },
  { id: 'search', icon: '🔍', label: 'Search' },
  { id: 'you',    icon: '👤', label: 'You' },
]

export default function Nav({ view, setView }) {
  return (
    <div className="flex flex-col items-center py-4 gap-1 flex-shrink-0"
      style={{ width: 60, background: '#0f0e1f', borderRight: '1px solid #1e1e2e' }}>
      <div className="flex items-center justify-center font-bold text-sm mb-4 rounded-xl"
        style={{ width: 36, height: 36, background: 'rgba(122,92,255,0.12)', border: '1px solid rgba(122,92,255,0.3)', color: '#7a5cff', fontFamily: 'Space Grotesk' }}>
        C
      </div>
      {ITEMS.map(item => (
        <button
          key={item.id}
          onClick={() => setView(item.id)}
          title={item.label}
          className="flex items-center justify-center rounded-xl text-lg transition-all"
          style={{
            width: 40, height: 40,
            background: view === item.id ? 'rgba(122,92,255,0.15)' : 'transparent',
            border: view === item.id ? '1px solid rgba(122,92,255,0.4)' : '1px solid transparent',
            color: view === item.id ? '#7a5cff' : '#3f3f5a',
            cursor: 'pointer'
          }}
        >
          {item.icon}
        </button>
      ))}
    </div>
  )
}
