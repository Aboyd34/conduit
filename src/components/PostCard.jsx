export default function PostCard({ post = {} }) {
  const { alias = 'Abc12..Xyz9', time = 'now', text = 'Signal incoming.', signals = 0 } = post
  return (
    <div className="rounded-xl p-4 transition-all"
      style={{ background: '#0f0e1f', border: '1px solid #1e1e2e' }}
      onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(122,92,255,0.35)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(122,92,255,0.1)'; }}
      onMouseOut={e => { e.currentTarget.style.borderColor = '#1e1e2e'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="w-1.5 h-1.5 rounded-full pulse" style={{ background: '#00ff9f' }} />
        <span className="text-xs font-mono" style={{ color: '#52525b' }}>◉ {alias}</span>
        <span className="text-xs ml-auto" style={{ color: '#3f3f46' }}>{time} ago</span>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: '#d4d4d8' }}>{text}</p>
      <div className="mt-3 flex gap-5 text-xs" style={{ color: '#52525b' }}>
        <button className="flex items-center gap-1 transition-colors hover:text-green-400">↑ signal ({signals})</button>
        <button className="transition-colors hover:text-purple-400">⟳ amplify</button>
        <button className="transition-colors hover:text-zinc-300">↩ reply</button>
        <button className="ml-auto transition-colors hover:text-red-400">🚩 report</button>
      </div>
    </div>
  )
}
