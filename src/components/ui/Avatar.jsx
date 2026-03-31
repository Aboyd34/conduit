import React from 'react'

export default function Avatar({ src, name, size = 36, online = false }) {
  const initials = (name || '?')[0].toUpperCase()

  return (
    <div style={{ position: 'relative', flexShrink: 0, width: size, height: size }}>
      <div style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'var(--primary-dim)',
        border: '1.5px solid var(--primary)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        color: 'var(--primary)',
        fontSize: size * 0.38,
        fontFamily: 'var(--font-ui)',
      }}>
        {src
          ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : initials
        }
      </div>
      {online && (
        <span style={{
          position: 'absolute',
          bottom: 1,
          right: 1,
          width: size * 0.27,
          height: size * 0.27,
          background: 'var(--success)',
          border: '2px solid var(--bg)',
          borderRadius: '50%',
        }} />
      )}
    </div>
  )
}
