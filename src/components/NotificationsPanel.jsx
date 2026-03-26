import React from 'react'

const ROOM_COLORS = { general:'#5b8cff', dev:'#9b5cff', privacy:'#00ffc3', aether:'#ffd700', random:'#ff6b6b' }

function NotifIcon({ type }) {
  const icons = { signal: '📶', reply: '💬', boost: '⚡', system: '📡', dm: '✉️' }
  return <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0 }}>{icons[type] || '📡'}</span>
}

export default function NotificationsPanel({ notifications = [], onMarkRead, onClear, onClose }) {
  const unread = notifications.filter(n => !n.read).length

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, width: 340, height: '100vh',
      background: '#0a0916', borderLeft: '1px solid #1e1c30',
      zIndex: 600, display: 'flex', flexDirection: 'column',
      boxShadow: '-8px 0 40px rgba(0,0,0,0.6)',
    }}>
      {/* Header */}
      <div style={{ padding: '18px 18px 14px', borderBottom: '1px solid #1e1c30', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 14, color: '#e2e8f0' }}>Notifications</span>
          {unread > 0 && <span style={{ marginLeft: 8, background: '#7c3aed', color: '#fff', fontSize: 10, fontFamily: 'monospace', padding: '1px 7px', borderRadius: 20 }}>{unread}</span>}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {notifications.length > 0 && (
            <button onClick={onClear} style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontFamily: 'monospace' }}>Clear all</button>
          )}
          <button onClick={onClose} style={{ fontSize: 18, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }}>
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', opacity: 0.3 }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📡</div>
            <p style={{ fontFamily: 'monospace', fontSize: 12 }}>No signals yet.</p>
          </div>
        ) : (
          notifications.map(n => (
            <div key={n.id} onClick={onMarkRead}
              style={{
                padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.04)',
                display: 'flex', gap: 12, alignItems: 'flex-start',
                background: n.read ? 'transparent' : 'rgba(124,58,237,0.05)',
                cursor: 'pointer', transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
              onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(124,58,237,0.05)'}
            >
              <NotifIcon type={n.type} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 11, color: n.room ? ROOM_COLORS[n.room] || '#a78bfa' : '#a78bfa' }}>#{n.room || 'system'}</span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>{n.ts ? new Date(n.ts).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) : ''}</span>
                </div>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {n.from && <span style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>{n.from} · </span>}
                  {n.preview}
                </p>
              </div>
              {!n.read && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c3aed', flexShrink: 0, marginTop: 5 }} />}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
