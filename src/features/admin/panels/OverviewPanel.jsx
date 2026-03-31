import React, { useState } from 'react'
import Chip from '../../../components/ui/Chip.jsx'
import Button from '../../../components/ui/Button.jsx'

const METRICS = [
  { label: 'Active Users', value: '—', color: 'var(--primary)' },
  { label: 'Rooms',        value: '—', color: 'var(--success)' },
  { label: 'Media Items',  value: '—', color: 'var(--warning)' },
  { label: 'Error Rate',   value: '0%', color: 'var(--danger)' },
]

export default function OverviewPanel({ conduit }) {
  const [signupsPaused, setSignupsPaused] = useState(false)
  const [readOnly, setReadOnly] = useState(false)

  return (
    <div className="admin-panel">
      <div className="admin-metrics">
        {METRICS.map(m => (
          <div key={m.label} className="admin-metric-card">
            <span className="admin-metric-value" style={{ color: m.color }}>{m.value}</span>
            <span className="admin-metric-label">{m.label}</span>
          </div>
        ))}
      </div>

      <div className="admin-grid">
        <div className="admin-card">
          <div className="admin-card-title">System Health</div>
          <div className="admin-status-row">
            <Chip variant="success">API OK</Chip>
            <Chip variant="success">WS OK</Chip>
            <Chip variant="success">DB OK</Chip>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-title">Quick Actions</div>
          <div className="admin-actions-row">
            <Button
              variant={signupsPaused ? 'danger' : 'ghost'}
              size="sm"
              onClick={() => setSignupsPaused(p => !p)}
            >
              {signupsPaused ? '▶ Resume Signups' : '⏸ Pause Signups'}
            </Button>
            <Button
              variant={readOnly ? 'danger' : 'ghost'}
              size="sm"
              onClick={() => setReadOnly(r => !r)}
            >
              {readOnly ? '✏ Disable Read-only' : '🔒 Read-only Mode'}
            </Button>
            <Button variant="danger" size="sm">
              🚨 Emergency Lock
            </Button>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-title">Moderation Queue</div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>3 items pending review.</p>
          <Button size="sm" variant="ghost" onClick={() => {}}>View Queue →</Button>
        </div>

        <div className="admin-card">
          <div className="admin-card-title">Recent Admin Sessions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[{ actor: 'root_admin', action: 'LOGIN', ts: '09:10' }, { actor: 'root_admin', action: 'ROOM_LOCKED', ts: '09:05' }].map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>{s.action}</span>
                <span style={{ color: 'var(--text-muted)' }}>{s.actor} · {s.ts}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
