import React, { useState } from 'react'
import ModerationItem from '../../../components/ModerationItem.jsx'
import Chip from '../../../components/ui/Chip.jsx'

const MOCK_FLAGS = [
  {
    id: 'f1', type: 'post', author: 'anon_signal', handle: 'anon_signal',
    timestamp: '10m ago', flagCount: 3, reason: 'Spam',
    content: 'Buy cheap CDT now!! 1000x guaranteed click here →…',
  },
  {
    id: 'f2', type: 'comment', author: 'ghost_7x', handle: 'ghost_7x',
    timestamp: '32m ago', flagCount: 1, reason: 'Harassment',
    content: 'You are literally the worst person I have ever seen on this platform.',
  },
  {
    id: 'f3', type: 'media', author: 'unknown_node', handle: 'unknown_node',
    timestamp: '1h ago', flagCount: 5, reason: 'NSFW — untagged',
    content: '[Photo attachment — flagged for review]',
  },
]

export default function ModerationPanel() {
  const [items, setItems] = useState(MOCK_FLAGS)
  const [filter, setFilter] = useState('all')

  const FILTERS = ['all', 'post', 'comment', 'media']

  const visible = filter === 'all' ? items : items.filter(i => i.type === filter)

  function handleAction({ id, action }) {
    if (action === 'dismiss' || action === 'redact') {
      setTimeout(() => setItems(prev => prev.filter(i => i.id !== id)), 600)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Chip variant="danger">⚑ {items.length} pending</Chip>
        <div style={{ display: 'flex', gap: 6, marginLeft: 8 }}>
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '4px 12px',
                borderRadius: 'var(--radius-sm)',
                background: filter === f ? 'var(--primary-dim)' : 'transparent',
                color: filter === f ? 'var(--primary)' : 'var(--text-muted)',
                border: filter === f ? '1px solid rgba(125,249,255,0.2)' : '1px solid var(--border)',
                fontFamily: 'var(--font-ui)',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          ✓ Queue clear
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {visible.map(item => (
            <ModerationItem key={item.id} item={item} onAction={handleAction} />
          ))}
        </div>
      )}
    </div>
  )
}
