import React from 'react'
import PulseCard from './pulse/PulseCard.jsx'

function PulseEmpty() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '60vh', gap: 12, opacity: 0.5,
    }}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#5b8cff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
      <p style={{ fontFamily: 'monospace', color: '#5b8cff', fontSize: 13 }}>No signals yet</p>
      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>Activity will appear here in real-time</p>
    </div>
  )
}

export default function PulseView({ pulses = [] }) {
  return (
    <div style={{ padding: '2rem', background: '#07060f', minHeight: '100vh', color: '#f1f1f7' }}>

      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'monospace', fontSize: 18, color: '#5b8cff', letterSpacing: 2 }}>PULSE</h1>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>Real-time activity across Conduit</p>
      </header>

      {pulses.length === 0 ? <PulseEmpty /> : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1rem',
        }}>
          {pulses.map(p => <PulseCard key={p.id} pulse={p} />)}
        </div>
      )}
    </div>
  )
}
