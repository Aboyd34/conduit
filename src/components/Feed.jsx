import PostCard from './PostCard.jsx'

const POSTS = [
  { id: 1, alias: 'Vx7r..K3mZ', time: '2m',  text: 'Zero-knowledge systems are becoming viable at scale. The next wave of privacy infra is here.', signals: 42 },
  { id: 2, alias: 'Qp2f..A9wL', time: '5m',  text: 'End-to-end encryption alone is not enough. Metadata reveals more than content ever could.', signals: 27 },
  { id: 3, alias: 'Jk8n..R1xD', time: '11m', text: 'Conduit makes surveillance obsolete. Build systems that work without trusting anyone.', signals: 18 },
]

export default function Feed() {
  return (
    <div className="flex flex-col flex-1 min-w-0 overflow-hidden" style={{ borderRight: '1px solid #1e1e2e' }}>
      {/* Compose bar */}
      <div className="p-4 flex-shrink-0" style={{ borderBottom: '1px solid #1e1e2e' }}>
        <div className="flex items-center gap-3 rounded-xl px-4 py-2.5"
          style={{ background: '#07060f', border: '1px solid #1e1e2e' }}>
          <span className="w-2 h-2 rounded-full pulse flex-shrink-0" style={{ background: '#00ff9f' }} />
          <input
            type="text"
            placeholder="Broadcast a signal..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: '#d4d4d8' }}
          />
          <button className="text-xs px-3 py-1 rounded-lg font-semibold transition-all"
            style={{ background: 'rgba(122,92,255,0.15)', border: '1px solid rgba(122,92,255,0.3)', color: '#7a5cff' }}>
            Send
          </button>
        </div>
      </div>
      {/* Posts */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {POSTS.map(p => <PostCard key={p.id} post={p} />)}
      </div>
    </div>
  )
}
