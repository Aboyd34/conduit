import React, { useState, useEffect } from 'react'
import Chip from '../../../components/ui/Chip.jsx'
import Button from '../../../components/ui/Button.jsx'

function Gauge({ label, value, max = 100, unit = '%', color = 'var(--primary)' }) {
  const pct = Math.min((value / max) * 100, 100)
  const chipVariant = pct > 85 ? 'danger' : pct > 65 ? 'warning' : 'success'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{label}</span>
        <Chip variant={chipVariant}>{value}{unit}</Chip>
      </div>
      <div style={{ height: 6, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`, background: color,
          borderRadius: 999, transition: 'width 0.5s ease',
        }} />
      </div>
    </div>
  )
}

const SERVICES = [
  { name: 'API Server',    status: 'ok'      },
  { name: 'WebSocket',     status: 'ok'      },
  { name: 'Database',      status: 'ok'      },
  { name: 'Media Storage', status: 'ok'      },
  { name: 'CDT Contract',  status: 'ok'      },
  { name: 'Aether AI',     status: 'ok'      },
]

export default function SystemPanel() {
  const [metrics, setMetrics] = useState({ cpu: 24, memory: 61, disk: 38, latency: 42 })

  // Simulate live metrics
  useEffect(() => {
    const t = setInterval(() => {
      setMetrics(m => ({
        cpu:     Math.min(99, Math.max(5,  m.cpu     + (Math.random() * 6 - 3)  | 0)),
        memory:  Math.min(99, Math.max(20, m.memory  + (Math.random() * 4 - 2)  | 0)),
        disk:    Math.min(99, Math.max(10, m.disk    + (Math.random() * 2 - 1)  | 0)),
        latency: Math.min(999, Math.max(8, m.latency + (Math.random() * 10 - 5) | 0)),
      }))
    }, 2000)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Service status */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)', padding: 16,
      }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>Services</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {SERVICES.map(s => (
            <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Chip variant={s.status === 'ok' ? 'success' : 'danger'}>
                {s.status === 'ok' ? '●' : '✕'}
              </Chip>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Live metrics */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)', padding: 16,
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)' }}>Live Metrics</p>
        <Gauge label="CPU" value={metrics.cpu} color="var(--primary)" />
        <Gauge label="Memory" value={metrics.memory} color="var(--success)" />
        <Gauge label="Disk" value={metrics.disk} color="var(--warning)" />
        <Gauge label="Latency" value={metrics.latency} max={500} unit="ms" color="var(--primary)" />
      </div>

      {/* Controls */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)', padding: 16,
      }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>Controls</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Button variant="ghost">Restart API</Button>
          <Button variant="ghost">Flush Cache</Button>
          <Button variant="ghost">Reload Config</Button>
          <Button variant="danger">Emergency Stop</Button>
        </div>
      </div>
    </div>
  )
}
