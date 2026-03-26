import React from 'react'

export default function TypingIndicator({ typists = [], color = '#a78bfa' }) {
  if (!typists.length) return null
  const label = typists.length === 1
    ? `${typists[0]} is typing`
    : typists.length === 2
    ? `${typists[0]} and ${typists[1]} are typing`
    : `${typists.length} people are typing`
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', marginBottom: 6 }}>
      {/* Animated dots */}
      <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            width: 5, height: 5, borderRadius: '50%', background: color,
            animation: `bounce 1.2s ${i * 0.2}s infinite ease-in-out`,
            opacity: 0.7,
          }} />
        ))}
      </div>
      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', fontFamily: 'monospace' }}>{label}…</span>
      <style>{`@keyframes bounce { 0%,80%,100%{transform:scaleY(1)} 40%{transform:scaleY(1.6)} }`}</style>
    </div>
  )
}
