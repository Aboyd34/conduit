export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-6"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(122,92,255,0.1) 0%, #07060f 65%)' }}
    >
      {/* Pill */}
      <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full text-xs font-medium"
        style={{ background: 'rgba(122,92,255,0.1)', border: '1px solid rgba(122,92,255,0.25)', color: '#7a5cff' }}>
        <span className="w-1.5 h-1.5 rounded-full bg-signal pulse inline-block" style={{ background: '#00ff9f' }} />
        End-to-end encrypted &middot; Zero accounts
      </div>

      {/* Logo */}
      <h1 className="text-7xl font-bold mb-4 tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
        CONDUIT<span style={{ color: '#7a5cff' }}>.</span>
      </h1>
      <p className="text-xl mb-2" style={{ color: '#a1a1aa' }}>Private. Encrypted. Real-Time Signal Network.</p>
      <p className="text-sm mb-10" style={{ color: '#3f3f5a' }}>No accounts. No tracking. No witnesses.</p>

      {/* CTAs */}
      <div className="flex gap-4 flex-wrap justify-center">
        <a href="/app"
          className="px-7 py-3 rounded-xl font-semibold text-sm text-white transition-all"
          style={{ background: 'linear-gradient(135deg,#7a5cff,#00d4ff)' }}
          onMouseOver={e => e.currentTarget.style.opacity='0.85'}
          onMouseOut={e => e.currentTarget.style.opacity='1'}>
          Enter Conduit
        </a>
        <a href="/about.html"
          className="px-7 py-3 rounded-xl font-semibold text-sm transition-all"
          style={{ border: '1px solid #2a2a3e', color: '#71717a' }}
          onMouseOver={e => { e.currentTarget.style.borderColor='rgba(122,92,255,0.4)'; e.currentTarget.style.color='#f0f0f0'; }}
          onMouseOut={e => { e.currentTarget.style.borderColor='#2a2a3e'; e.currentTarget.style.color='#71717a'; }}>
          Learn More
        </a>
      </div>

      <p className="mt-10 text-xs" style={{ color: '#2a2a3e' }}>18+ only &middot; All activity monitored for compliance</p>
    </div>
  )
}
