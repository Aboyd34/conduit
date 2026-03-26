import React from 'react'
import PulseCard from './pulse/PulseCard'

export default function PulseView({ pulses = [] }) {
  return (
    <div className="p-6 bg-bg min-h-screen text-textMain">

      <header className="mb-6">
        <h1 className="font-mono text-xl text-cyan">PULSE</h1>
        <p className="text-sm text-textDim">Real-time activity across Conduit</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pulses.map(p => (
          <PulseCard key={p.id} pulse={p} />
        ))}
      </div>

    </div>
  )
}
