export function PostCard({ post = {}, onViewProfile }) {
  const {
    id,
    alias = 'Anon',
    sender,
    ts,
    content = '',
    text = '',
    signals = 0,
    topic = 'public'
  } = post

  const displayText = content || text || 'Signal incoming.'
  const displayAlias = alias || (sender ? sender.slice(0, 12) + '...' : 'Anon')
  const displayTime = ts ? new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'now'

  return (
    <div
      className="rounded-xl p-4 transition-all"
      style={{ background: '#0f0e1f', border: '1px solid #1e1e2e', marginBottom: '0.65rem' }}
      onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(122,92,255,0.35)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(122,92,255,0.08)'; }}
      onMouseOut={e => { e.currentTarget.style.borderColor = '#1e1e2e'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00ff9f', display: 'inline-block' }} className="pulse" />
        <span
          style={{ color: '#52525b', fontSize: '0.75rem', fontFamily: 'Space Grotesk', cursor: onViewProfile ? 'pointer' : 'default' }}
          onClick={() => onViewProfile && onViewProfile(sender)}
        >◉ {displayAlias}</span>
        <span style={{ color: '#3f3f46', fontSize: '0.7rem', marginLeft: 'auto' }}>{displayTime}</span>
        <span style={{ color: '#2a2a3e', fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: 4, border: '1px solid #1e1e2e' }}>#{topic}</span>
      </div>
      <p style={{ color: '#d4d4d8', fontSize: '0.875rem', lineHeight: 1.55, margin: 0 }}>{displayText}</p>
      <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1.25rem', fontSize: '0.75rem', color: '#52525b' }}>
        <button type="button" style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
          onMouseOver={e => e.currentTarget.style.color = '#00ff9f'}
          onMouseOut={e => e.currentTarget.style.color = '#52525b'}
        >↑ signal ({signals})</button>
        <button type="button" style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
          onMouseOver={e => e.currentTarget.style.color = '#7a5cff'}
          onMouseOut={e => e.currentTarget.style.color = '#52525b'}
        >⟳ amplify</button>
        <button type="button" style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
          onMouseOver={e => e.currentTarget.style.color = '#d4d4d8'}
          onMouseOut={e => e.currentTarget.style.color = '#52525b'}
        >↩ reply</button>
        <button type="button" style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', marginLeft: 'auto' }}
          onMouseOver={e => e.currentTarget.style.color = '#ef4444'}
          onMouseOut={e => e.currentTarget.style.color = '#52525b'}
        >🚩</button>
      </div>
    </div>
  )
}

export default PostCard
