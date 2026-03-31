import React from 'react'
import Avatar from '../../components/ui/Avatar.jsx'
import Chip from '../../components/ui/Chip.jsx'
import Button from '../../components/ui/Button.jsx'

export default function RoomHeader({ room = {}, onlineCount = 0, onLeave, onSettings }) {
  const { name, description, memberCount = 0, isLocked, isSlowMode, pinnedMessage } = room

  return (
    <div style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      padding: '12px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
              # {name || 'room'}
            </span>
            {isLocked && <Chip variant="warning">🔒 Locked</Chip>}
            {isSlowMode && <Chip variant="muted">🐌 Slow</Chip>}
          </div>
          {description && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{description}</p>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Chip variant="success">● {onlineCount} online</Chip>
          <Chip variant="muted">{memberCount} members</Chip>
          {onSettings && (
            <Button variant="ghost" size="sm" onClick={onSettings}>Settings</Button>
          )}
          {onLeave && (
            <Button variant="danger" size="sm" onClick={onLeave}>Leave</Button>
          )}
        </div>
      </div>

      {pinnedMessage && (
        <div style={{
          background: 'var(--primary-dim)',
          border: '1px solid rgba(125,249,255,0.15)',
          borderRadius: 'var(--radius-sm)',
          padding: '6px 12px',
          fontSize: 12,
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          📌 {pinnedMessage}
        </div>
      )}
    </div>
  )
}
