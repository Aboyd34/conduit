import React from 'react'
import { Avatar } from './UserProfile.jsx'

export default function NotificationsPanel({ notifications = [], onDismiss, onClear }) {
  const unread = notifications.filter(n => !n.read).length

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, height: '100vh', width: 300, zIndex: 400,
      background: 'linear-gradient(135deg,#0f0e1a,#16142a)',
      borderLeft: '1px solid #2d2a4a',
      display: 'flex', flexDirection: 'column',
      boxShadow: '-8px 0 32px rgba(7,6,15,0.6)',
    }}>
      {/* Header */}
      <div style={{ padding: '18px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: 2 }}>PULSE</span>
          {unread > 0 && <span style={{ fontSize: 9, background: '#7c3aed', color: '#fff', padding: '1px 6px', borderRadius: 10, fontFamily: 'monospace', fontWeight: 700 }}>{unread}</span>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {notifications.length > 0 && <button onClick={onClear} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: 10, fontFamily: 'monospace' }}>Clear all</button>}
          <button onClick={onDismiss} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 16 }}>×</button>
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {notifications.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', gap: 10, opacity: 0.3 }}>
            <div style={{ fontSize: 28 }}>📡</div>
            <p style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0 }}>No pulse activity yet</p>
          </div>
        ) : notifications.slice().reverse().map((n, i) => (
          <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.03)', background: n.read ? 'transparent' : 'rgba(124,58,237,0.05)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <Avatar fingerprint={n.from || 'system'} handle={n.from} size={28} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
                <span style={{ color: '#a78bfa', fontFamily: 'monospace' }}>{n.from || 'System'}</span>{' '}{n.action}
              </div>
              {n.preview && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'monospace' }}>"{ n.preview}"</div>}
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', marginTop: 4 }}>{n.time} · {n.room}</div>
            </div>
            {!n.read && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#7c3aed', flexShrink: 0, marginTop: 4 }} />}
          </div>
        ))}
      </div>
    </div>
  )
}
