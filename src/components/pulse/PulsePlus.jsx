import React from 'react'
import PulseCard from './PulseCard'
import PulseFilters from './PulseFilters'
import PulseHeatmap from './PulseHeatmap'
import PulseVelocity from './PulseVelocity'

export default function PulsePlus({ pulses = [] }) {
  return (
    <div className="p-6 bg-bg min-h-screen text-textMain">

      <header className="mb-6">
        <h1 className="font-mono text-xl text-signal">PULSE+</h1>
        <p className="text-sm text-textDim">Aether-tier signal dashboard</p>
      </header>

      <PulseFilters />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <PulseHeatmap />
        <PulseVelocity />
        <div className="bg-glass border border-border rounded-2xl p-4 backdrop-blur-md">
          <h3 className="font-mono text-xs text-cyan uppercase tracking-widest mb-3">Recycle Burn Meter</h3>
          <div className="h-28 bg-surface rounded-xl opacity-50" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {pulses.map(p => <PulseCard key={p.id} pulse={p} />)}
      </div>

    </div>
  )
}
