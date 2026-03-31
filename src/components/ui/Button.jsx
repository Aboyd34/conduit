import React from 'react'

const VARIANTS = {
  primary: {
    background: 'var(--primary)',
    color: '#0A0A0C',
    border: 'none',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border)',
  },
  danger: {
    background: 'rgba(255,59,85,0.12)',
    color: 'var(--danger)',
    border: '1px solid rgba(255,59,85,0.2)',
  },
  success: {
    background: 'rgba(77,255,180,0.1)',
    color: 'var(--success)',
    border: '1px solid rgba(77,255,180,0.2)',
  },
}

export default function Button({
  children,
  variant = 'ghost',
  size = 'md',
  onClick,
  disabled = false,
  icon,
  style = {},
  ...props
}) {
  const v = VARIANTS[variant] || VARIANTS.ghost
  const padding = size === 'sm' ? '5px 12px' : size === 'lg' ? '10px 24px' : '7px 16px'
  const fontSize = size === 'sm' ? 11 : size === 'lg' ? 15 : 13

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding,
        borderRadius: 'var(--radius-sm)',
        fontFamily: 'var(--font-ui)',
        fontWeight: 600,
        fontSize,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'all var(--transition)',
        ...v,
        ...style,
      }}
      {...props}
    >
      {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </button>
  )
}
