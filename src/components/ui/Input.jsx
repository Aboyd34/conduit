import React from 'react'

export default function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  icon,
  mono = false,
  style = {},
  ...props
}) {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {icon && (
        <span style={{
          position: 'absolute',
          left: 10,
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'none',
        }}>
          {icon}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: '100%',
          background: 'var(--surface-raised)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: icon ? '8px 12px 8px 34px' : '8px 12px',
          color: 'var(--text-primary)',
          fontFamily: mono ? 'var(--font-mono)' : 'var(--font-ui)',
          fontSize: 13,
          outline: 'none',
          transition: 'border-color var(--transition), box-shadow var(--transition)',
          ...style,
        }}
        onFocus={e => {
          e.target.style.borderColor = 'rgba(125,249,255,0.4)'
          e.target.style.boxShadow = '0 0 0 3px var(--primary-dim)'
        }}
        onBlur={e => {
          e.target.style.borderColor = 'var(--border)'
          e.target.style.boxShadow = 'none'
        }}
        {...props}
      />
    </div>
  )
}
