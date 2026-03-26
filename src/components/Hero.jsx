import React from 'react'

export default function Hero() {
  return (
    <div className="h-screen flex flex-col justify-center items-center text-center px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary opacity-5 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-2xl">
        <div className="inline-flex items-center gap-2 bg-surface border border-primary/20 rounded-full px-4 py-1.5 mb-8 text-xs text-primary font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-signal inline-block" />
          End-to-end encrypted &middot; Zero accounts
        </div>

        <h1 className="text-7xl font-bold mb-5 tracking-tight font-mono">
          CONDUIT
          <span className="text-primary">.</span>
        </h1>
        <p className="text-xl text-textDim mb-3 leading-relaxed">
          Private. Encrypted. Real-Time Signal Network.
        </p>
        <p className="text-sm mb-10" style={{ color: '#3f3f5a' }}>
          No accounts. No tracking. No witnesses.
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <a
            href="/app"
            className="px-7 py-3 bg-gradient-to-r from-primary to-secondary hover:opacity-85 rounded-xl font-semibold text-white transition-all duration-200 hover:shadow-glow"
          >
            Enter Conduit
          </a>
          <a
            href="/about.html"
            className="px-7 py-3 border border-border hover:border-primary/40 rounded-xl font-semibold text-textDim hover:text-textMain transition-all duration-200"
          >
            Learn More
          </a>
        </div>

        <p className="mt-10 text-xs" style={{ color: '#3f3f5a' }}>No logs. No surveillance. No central authority.</p>
      </div>
    </div>
  )
}
