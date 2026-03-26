import React from 'react'

export default function PulseHeatmap() {
  return (
    <div className="bg-glass border border-border p-4 rounded-2xl backdrop-blur-md h-40">
      <h3 className="font-mono text-xs text-cyan uppercase tracking-widest mb-3">Activity Heatmap</h3>
      <div className="h-full bg-surface rounded-xl opacity-50" />
    </div>
  )
}
