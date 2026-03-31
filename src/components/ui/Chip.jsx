import React from 'react'

const VARIANTS = {
  default: { bg: 'var(--primary-dim)', color: 'var(--primary)', border: 'rgba(125,249,255,0.2)' },
  success: { bg: 'rgba(77,255,180,0.1)', color: 'var(--success)', border: 'rgba(77,255,180,0.2)' },
  danger:  { bg: 'rgba(255,59,85,0.1)',  color: 'var(--danger)',  border: 'rgba(255,59,85,0.2)'  },
  warning: { bg: 'rgba(255,181,71,0.1)', color: 'var(--warning)', border: 'rgba(255,181,71,0.2)' },
  muted:   { bg: 'var(--surface-raised)', color: 'var(--text-muted)', border: 'var(--border)' },
}

export default function Chip({ children, variant = 'default', icon, style = {} }) {
  const v = VARIANTS[variant] || VARIANTS.default
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '3px 10px',
      background: v.bg,
      color: v.color,
      border: `1px solid ${v.border}`,
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 600,
      fontFamily: 'var(--font-mono)',
      whiteSpace: 'nowrap',
      ...style,
    }}>
      {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </span>
  )
}
