import React, { useState, useMemo } from 'react'
import Input from '../../../components/ui/Input.jsx'
import Button from '../../../components/ui/Button.jsx'
import Chip from '../../../components/ui/Chip.jsx'
import Avatar from '../../../components/ui/Avatar.jsx'

const MOCK_USERS = [
  { fp: 'a1b2c3d4', handle: 'satoshi_ghost', role: 'user', status: 'active', joined: '2026-01-12', posts: 142 },
  { fp: 'e5f6a7b8', handle: 'vitalik_echo', role: 'user', status: 'active', joined: '2026-02-01', posts: 89 },
  { fp: 'c9d0e1f2', handle: 'anon_signal', role: 'user', status: 'restricted', joined: '2026-03-10', posts: 34 },
  { fp: 'b3c4d5e6', handle: 'root_admin', role: 'admin', status: 'active', joined: '2026-01-01', posts: 7 },
]

const STATUS_VARIANT = { active: 'success', restricted: 'warning', locked: 'danger' }

export default function UsersPanel() {
  const [query, setQuery] = useState('')
  const [actioned, setActioned] = useState({})

  const filtered = useMemo(() =>
    MOCK_USERS.filter(u =>
      u.handle.toLowerCase().includes(query.toLowerCase()) ||
      u.fp.includes(query)
    ), [query]
  )

  function doAction(fp, action) {
    setActioned(a => ({ ...a, [fp]: action }))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ maxWidth: 380 }}>
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by handle or key…"
          icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(u => (
          <div key={u.fp} style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            opacity: actioned[u.fp] ? 0.4 : 1,
            transition: 'opacity 0.2s',
          }}>
            <Avatar name={u.handle} size={36} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 13 }}>@{u.handle}</span>
                <Chip variant={u.role === 'admin' ? 'danger' : 'muted'}>{u.role}</Chip>
                <Chip variant={STATUS_VARIANT[u.status] || 'muted'}>{u.status}</Chip>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 3 }}>
                {u.fp} · joined {u.joined} · {u.posts} posts
              </div>
            </div>
            {!actioned[u.fp] ? (
              <div style={{ display: 'flex', gap: 6 }}>
                <Button size="sm" variant="ghost" onClick={() => doAction(u.fp, 'rate-limited')}>Rate Limit</Button>
                <Button size="sm" variant="ghost" style={{ color: 'var(--warning)' }} onClick={() => doAction(u.fp, 'soft-locked')}>Soft Lock</Button>
                <Button size="sm" variant="danger" onClick={() => doAction(u.fp, 'revoked')}>Revoke</Button>
              </div>
            ) : (
              <Chip variant="warning">{actioned[u.fp]}</Chip>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12, padding: '20px 0' }}>
            No users match "{query}"
          </p>
        )}
      </div>
    </div>
  )
}
