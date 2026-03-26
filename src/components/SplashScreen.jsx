import React, { useEffect, useState } from 'react'

/**
 * SplashScreen — shown for ~1.8s on first load before app mounts.
 * Usage: wrap around <App /> in main.jsx and pass onDone callback.
 */
export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState('in') // in | hold | out

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 400)
    const t2 = setTimeout(() => setPhase('out'), 1600)
    const t3 = setTimeout(() => onDone && onDone(), 2000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#07060f',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      opacity: phase === 'out' ? 0 : 1,
      transition: phase === 'out' ? 'opacity 0.4s ease' : 'none',
      pointerEvents: phase === 'out' ? 'none' : 'all',
    }}>
      {/* Glow backdrop */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)',
        width: 400, height: 300, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(200,160,20,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <img
        src="/logo.png"
        alt="Conduit"
        style={{
          width: 'clamp(90px, 20vw, 130px)',
          height: 'auto',
          marginBottom: 22,
          opacity: phase === 'in' ? 0 : 1,
          transform: phase === 'in' ? 'scale(0.85)' : 'scale(1)',
          transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.16,1,0.3,1)',
          filter: 'drop-shadow(0 0 28px rgba(200,160,20,0.5))',
          animation: phase === 'hold' ? 'splashPulse 1.2s ease-in-out infinite' : 'none',
          position: 'relative', zIndex: 1,
        }}
      />

      <div style={{
        fontFamily: 'monospace', fontSize: 'clamp(14px,3vw,18px)',
        fontWeight: 900, letterSpacing: '0.35em',
        color: '#c8a014',
        opacity: phase === 'in' ? 0 : 1,
        transition: 'opacity 0.5s ease 0.1s',
        position: 'relative', zIndex: 1,
      }}>CONDUIT</div>

      <div style={{
        marginTop: 24,
        display: 'flex', gap: 6,
        opacity: phase === 'hold' ? 1 : 0,
        transition: 'opacity 0.3s ease 0.4s',
        position: 'relative', zIndex: 1,
      }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            width: 5, height: 5, borderRadius: '50%',
            background: '#c8a014',
            animation: `dotBounce 0.9s ease-in-out ${i * 0.15}s infinite`,
            opacity: 0.6,
          }} />
        ))}
      </div>

      <style>{`
        @keyframes splashPulse {
          0%, 100% { filter: drop-shadow(0 0 28px rgba(200,160,20,0.5)); }
          50%       { filter: drop-shadow(0 0 44px rgba(200,160,20,0.75)); }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40%            { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
