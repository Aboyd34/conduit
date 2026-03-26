import React, { useEffect, useState } from 'react'

export default function Home() {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), 80) }, [])

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '0 24px',
        background: '#07060f',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 400, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(200,160,20,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', left: '50%', transform: 'translateX(-50%)',
        width: 400, height: 200, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(124,58,237,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Animated container */}
      <div style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'all 0.7s cubic-bezier(0.16,1,0.3,1)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        position: 'relative', zIndex: 1,
      }}>

        {/* Status pill */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          marginBottom: 36, padding: '6px 16px', borderRadius: 999,
          background: 'rgba(200,160,20,0.07)', border: '1px solid rgba(200,160,20,0.2)',
          color: '#c8a014', fontSize: 11, fontFamily: 'monospace', letterSpacing: 1.5,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00ffc3', display: 'inline-block', boxShadow: '0 0 6px #00ffc3' }} />
          SIGNAL NETWORK LIVE
        </div>

        {/* Logo image */}
        <img
          src="/logo.png"
          alt="Conduit"
          style={{
            width: 'clamp(120px, 30vw, 180px)',
            height: 'auto',
            marginBottom: 32,
            filter: 'drop-shadow(0 0 32px rgba(200,160,20,0.35)) drop-shadow(0 0 8px rgba(200,160,20,0.2))',
            animation: 'logoPulse 4s ease-in-out infinite',
          }}
        />

        {/* Wordmark */}
        <h1 style={{
          fontFamily: 'monospace',
          fontSize: 'clamp(32px, 8vw, 56px)',
          fontWeight: 900,
          letterSpacing: '0.25em',
          color: '#fff',
          margin: '0 0 12px',
          textShadow: '0 0 40px rgba(200,160,20,0.3)',
        }}>
          CONDUIT
        </h1>

        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.35)', margin: '0 0 6px', letterSpacing: 1 }}>
          Private. Encrypted. Real-Time Signal Network.
        </p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.15)', margin: '0 0 44px', fontFamily: 'monospace' }}>
          No accounts. No tracking. No witnesses.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 48 }}>
          <a
            href="/rooms"
            style={{
              padding: '13px 36px', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, #c8a014, #a07810)',
              color: '#07060f', fontWeight: 900, fontSize: 14,
              fontFamily: 'monospace', letterSpacing: 2,
              textDecoration: 'none', boxShadow: '0 4px 24px rgba(200,160,20,0.3)',
              transition: 'all 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.boxShadow = '0 6px 32px rgba(200,160,20,0.5)'}
            onMouseOut={e => e.currentTarget.style.boxShadow = '0 4px 24px rgba(200,160,20,0.3)'}
          >
            ENTER CONDUIT ⚡
          </a>
          <a
            href="/about.html"
            style={{
              padding: '13px 28px', borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.35)', fontSize: 13,
              fontFamily: 'monospace', letterSpacing: 1,
              textDecoration: 'none', transition: 'all 0.2s',
            }}
            onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(200,160,20,0.4)'; e.currentTarget.style.color = '#c8a014' }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}
          >
            Learn More
          </a>
        </div>

        {/* Footer line */}
        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.1)', fontFamily: 'monospace', letterSpacing: 2 }}>
          NO LOGS · NO SURVEILLANCE · NO CENTRAL AUTHORITY
        </p>
      </div>

      <style>{`
        @keyframes logoPulse {
          0%, 100% { filter: drop-shadow(0 0 32px rgba(200,160,20,0.35)) drop-shadow(0 0 8px rgba(200,160,20,0.2)); }
          50%       { filter: drop-shadow(0 0 48px rgba(200,160,20,0.55)) drop-shadow(0 0 16px rgba(200,160,20,0.35)); }
        }
      `}</style>
    </div>
  )
}
