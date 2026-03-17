const ROOMS = [
  { id: 1, name: '#general', desc: 'Open signal', count: 24, active: true },
  { id: 2, name: '#tech', desc: 'Dev & crypto', count: 11 },
  { id: 3, name: '#alpha', desc: 'Vetted only', count: 7, gated: true },
  { id: 4, name: '#darknet', desc: 'Onion-routed', count: 3, gated: true },
]

export default function RoomList() {
  return (
    <div className="flex flex-col flex-shrink-0 overflow-hidden"
      style={{ width: 216, background: '#0f0e1f', borderRight: '1px solid #1e1e2e' }}>
      <div className="px-4 py-3" style={{ borderBottom: '1px solid #1e1e2e' }}>
        <p className="text-xs font-semibold">Rooms</p>
        <p className="text-xs mt-0.5" style={{ color: '#52525b' }}>Live channels</p>
      </div>
      <div className="flex flex-col gap-0.5 p-2 flex-1 overflow-y-auto">
        {ROOMS.map(r => (
          <button key={r.id}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-left w-full transition-all"
            style={{
              background: r.active ? 'rgba(0,212,255,0.07)' : 'transparent',
              border: r.active ? '1px solid rgba(0,212,255,0.2)' : '1px solid transparent',
              color: r.active ? '#00d4ff' : '#52525b',
              cursor: 'pointer'
            }}
          >
            <span className="text-base flex-shrink-0">{r.gated ? '🔒' : '⚡'}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{r.name}</p>
              <p className="text-xs truncate" style={{ color: '#3f3f46' }}>{r.desc}</p>
            </div>
            <span className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#52525b' }}>{r.count}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
