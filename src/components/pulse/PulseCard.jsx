import React from 'react'

export default function PulseCard({ pulse }) {
  return (
    <div className="bg-glass border border-border p-4 rounded-2xl backdrop-blur-md hover:border-primary hover:shadow-glow transition">
      <div className="text-xs font-mono text-textDim">{pulse.fingerprint}</div>
      <div className="mt-2 text-sm">
        <span className="text-primary">#{pulse.room}</span>
        <span className="text-textDim"> — {pulse.action}</span>
      </div>
      <p className="mt-2 text-sm text-textMain">{pulse.preview}</p>
      <div className="mt-3 text-xs text-textDim">{pulse.time}</div>
    </div>
  )
}
