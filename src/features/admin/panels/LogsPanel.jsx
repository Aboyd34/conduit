import React, { useState, useMemo } from 'react'
import Input from '../../../components/ui/Input.jsx'
import Button from '../../../components/ui/Button.jsx'
import Chip from '../../../components/ui/Chip.jsx'

const MOCK_LOGS = [
  { id: 'l1', ts: '2026-03-31 09:10:02', level: 'info',  actor: 'root_admin', action: 'LOGIN',           detail: 'Admin session started' },
  { id: 'l2', ts: '2026-03-31 09:08:44', level: 'warn',  actor: 'system',     action: 'RATE_LIMIT_HIT',  detail: 'anon_signal exceeded 60 req/min' },
  { id: 'l3', ts: '2026-03-31 09:05:11', level: 'info',  actor: 'root_admin', action: 'ROOM_LOCKED',     detail: 'Room #general locked by admin' },
  { id: 'l4', ts: '2026-03-31 08:59:33', level: 'error', actor: 'system',     action: 'WS_DISCONNECT',   detail: 'WebSocket dropped 3 clients' },
  { id: 'l5', ts: '2026-03-31 08:55:00', level: 'info',  actor: 'root_admin', action: 'POST_REDACTED',   detail: 'Post f1 redacted from moderation queue' },
  { id: 'l6', ts: '2026-03-31 08:40:12', level: 'warn',  actor: 'system',     action: 'HIGH_MEMORY',     detail: 'Heap usage at 78%' },
]

const LEVEL_VARIANT = { info: 'default', warn: 'warning', error: 'danger' }

export default function LogsPanel() {
  const [query, setQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')

  const filtered = useMemo(() =>
    MOCK_LOGS.filter(l => {
      const matchLevel = levelFilter === 'all' || l.level === levelFilter
      const matchQuery = !query || l.action.toLowerCase().includes(query.toLowerCase()) || l.detail.toLowerCase().includes(query.toLowerCase()) || l.actor.toLowerCase().includes(query.toLowerCase())
      return matchLevel && matchQuery
    }), [query, levelFilter]
  )

  function exportLogs() {
    const data = JSON.stringify(filtered, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `conduit-logs-${Date.now()}.json`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 220, maxWidth: 360 }}>
          <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search logs…"
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>}
          />
        </div>
        {['all','info','warn','error'].map(l => (
          <button key={l} onClick={() => setLevelFilter(l)} style={{
            padding: '5px 12px', borderRadius: 'var(--radius-sm)', fontSize: 11, fontWeight: 500,
            fontFamily: 'var(--font-mono)', cursor: 'pointer', transition: 'all 0.15s',
            background: levelFilter === l ? 'var(--primary-dim)' : 'transparent',
            color: levelFilter === l ? 'var(--primary)' : 'var(--text-muted)',
            border: levelFilter === l ? '1px solid rgba(125,249,255,0.2)' : '1px solid var(--border)',
          }}>{l}</button>
        ))}
        <Button size="sm" variant="ghost" onClick={exportLogs}>↓ Export</Button>
      </div>

      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
      }}>
        {filtered.length === 0 ? (
          <p style={{ padding: '24px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>No logs match filter.</p>
        ) : filtered.map((log, i) => (
          <div key={log.id} style={{
            display: 'grid',
            gridTemplateColumns: '160px 60px 100px 1fr',
            gap: 12,
            padding: '9px 16px',
            borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
            alignItems: 'center',
            transition: 'background 0.1s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-raised)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>{log.ts}</span>
            <Chip variant={LEVEL_VARIANT[log.level] || 'muted'}>{log.level}</Chip>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--primary)' }}>{log.action}</span>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{log.detail} <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>· {log.actor}</span></span>
          </div>
        ))}
      </div>
    </div>
  )
}
