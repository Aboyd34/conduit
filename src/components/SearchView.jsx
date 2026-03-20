import { useState, useMemo } from 'react'
import { useConduitSocket } from '../hooks/useConduitSocket.js'

export default function SearchView({ onViewProfile }) {
  const { posts } = useConduitSocket()
  const [query, setQuery] = useState('')
  const [topicFilter, setTopicFilter] = useState('all')

  const topics = ['all', 'public', 'crypto', 'dev', 'aether', 'lounge']

  const results = useMemo(() => {
    if (!query.trim() && topicFilter === 'all') return []
    return posts.filter(p => {
      const matchTopic = topicFilter === 'all' || (p.topic || 'public') === topicFilter
      const matchQuery = !query.trim() || (p.content || '').toLowerCase().includes(query.toLowerCase())
      return matchTopic && matchQuery
    }).slice(0, 40)
  }, [posts, query, topicFilter])

  return (
    <div style={{ padding: '1.5rem', maxWidth: 720, margin: '0 auto' }}>
      <h2 style={{ color: '#f0f0f0', fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.25rem' }}>🔍 Search</h2>

      {/* Search input */}
      <input
        type="text"
        placeholder="Search signals..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        style={{
          width: '100%', padding: '0.75rem 1rem',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid #1e1e2e',
          borderRadius: 10, color: '#f0f0f0',
          fontSize: '0.9rem', outline: 'none',
          marginBottom: '1rem',
          fontFamily: 'Inter, sans-serif'
        }}
      />

      {/* Topic filter */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        {topics.map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setTopicFilter(t)}
            style={{
              padding: '0.3rem 0.85rem',
              borderRadius: 999,
              border: topicFilter === t ? '1px solid #7a5cff' : '1px solid #1e1e2e',
              background: topicFilter === t ? 'rgba(122,92,255,0.15)' : 'transparent',
              color: topicFilter === t ? '#7a5cff' : '#52525b',
              fontSize: '0.75rem', cursor: 'pointer',
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 600, textTransform: 'capitalize'
            }}
          >{t}</button>
        ))}
      </div>

      {/* Results */}
      {results.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#3f3f5a', marginTop: '3rem' }}>
          <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</p>
          <p>{query || topicFilter !== 'all' ? 'No signals found.' : 'Type to search all signals.'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {results.map(p => (
            <div key={p.id} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid #1e1e2e',
              borderRadius: 12,
              padding: '0.85rem 1rem',
              cursor: 'pointer'
            }}
            onClick={() => onViewProfile && onViewProfile(p.sender)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: '#7a5cff', fontSize: '0.75rem', fontWeight: 700, fontFamily: 'Space Grotesk' }}>#{p.topic || 'public'}</span>
                <span style={{ color: '#3f3f5a', fontSize: '0.7rem' }}>{p.ts ? new Date(p.ts).toLocaleTimeString() : ''}</span>
              </div>
              <p style={{ color: '#d4d4d8', fontSize: '0.9rem', lineHeight: 1.55, margin: 0 }}>{p.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
