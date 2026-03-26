import React from 'react'

export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-6"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(91,140,255,0.08) 0%, #05050a 65%)' }}
    >
      {/* Pill */}
      <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full text-xs font-medium"
        style={{ background: 'rgba(91,140,255,0.08)', border: '1px solid rgba(91,140,255,0.2)', color: '#5b8cff' }}>
        <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#00ffc3' }} />
        End-to-end encrypted &middot; Zero accounts
      </div>

      {/* Logo */}
      <h1 className="text-7xl font-bold mb-4 tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
        CONDUIT<span style={{ color: '#5b8cff' }}>.</span>
      </h1>
      <p className="text-xl mb-2" style={{ color: '#8c8ca3' }}>Private. Encrypted. Real-Time Signal Network.</p>
      <p className="text-sm mb-10" style={{ color: '#3f3f5a' }}>No accounts. No tracking. No witnesses.</p>

      {/* CTAs */}
      <div className="flex gap-4 flex-wrap justify-center">
        <a href="/app"
          className="px-7 py-3 rounded-xl font-semibold text-sm text-white transition-all"
          style={{ background: 'linear-gradient(135deg,#5b8cff,#9b5cff)' }}
          onMouseOver={e => e.currentTarget.style.opacity='0.85'}
          onMouseOut={e => e.currentTarget.style.opacity='1'}>
          Enter Conduit
        </a>
        <a href="/about.html"
          className="px-7 py-3 rounded-xl font-semibold text-sm transition-all"
          style={{ border: '1px solid rgba(255,255,255,0.06)', color: '#8c8ca3' }}
          onMouseOver={e => { e.currentTarget.style.borderColor='rgba(91,140,255,0.4)'; e.currentTarget.style.color='#f1f1f7'; }}
          onMouseOut={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'; e.currentTarget.style.color='#8c8ca3'; }}>
          Learn More
        </a>
      </div>

      <p className="mt-10 text-xs" style={{ color: '#3f3f5a' }}>No logs. No surveillance. No central authority.</p>
    </div>
  )
}
