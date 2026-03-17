const SIGNALS = [
  { tag: '#ZK',      text: 'Zero-knowledge thread',    delta: '+14' },
  { tag: '#E2E',     text: 'Encryption protocol debate', delta: '+9' },
  { tag: '#Mesh',    text: 'P2P routing breakthrough',   delta: '+7' },
  { tag: '#Privacy', text: 'Browser fingerprint bypass', delta: '+5' },
]

export default function IntelPanel() {
  return (
    <div className="flex flex-col flex-shrink-0 overflow-hidden"
      style={{ width: 224, background: '#0f0e1f', borderRight: '1px solid #1e1e2e' }}>
      <div className="px-4 py-3" style={{ borderBottom: '1px solid #1e1e2e' }}>
        <p className="text-xs font-semibold">Trending Signals</p>
        <p className="text-xs mt-0.5" style={{ color: '#52525b' }}>Live activity</p>
      </div>
      <div className="flex flex-col gap-1.5 p-3 flex-1 overflow-y-auto">
        {SIGNALS.map(s => (
          <div key={s.tag} className="flex items-start gap-2 px-3 py-2.5 rounded-lg"
            style={{ background: 'rgba(7,6,15,0.6)', border: '1px solid #1a1a2e' }}>
            <span className="text-xs font-mono mt-0.5 flex-shrink-0" style={{ color: '#7a5cff' }}>{s.tag}</span>
            <p className="text-xs flex-1 leading-relaxed" style={{ color: '#71717a' }}>{s.text}</p>
            <span className="text-xs font-semibold flex-shrink-0" style={{ color: '#00ff9f' }}>{s.delta}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
