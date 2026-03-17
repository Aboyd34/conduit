export default function Hero() {
  return (
    <div className="h-screen flex flex-col justify-center items-center text-center px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent opacity-5 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-2xl">
        <div className="inline-flex items-center gap-2 bg-panel border border-accent/20 rounded-full px-4 py-1.5 mb-8 text-xs text-accent font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-signal pulse inline-block" />
          End-to-end encrypted · Zero accounts
        </div>

        <h1 className="text-7xl font-bold mb-5 tracking-tight font-mono">
          CONDUIT
          <span className="text-accent">.</span>
        </h1>
        <p className="text-xl text-zinc-400 mb-3 leading-relaxed">
          Private. Encrypted. Real-Time Signal Network.
        </p>
        <p className="text-sm text-zinc-600 mb-10">
          No accounts. No tracking. No witnesses.
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <a
            href="/app"
            className="px-7 py-3 bg-accent hover:bg-accent/80 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-accent/25"
          >
            Enter Conduit
          </a>
          <a
            href="/about.html"
            className="px-7 py-3 border border-zinc-700 hover:border-accent/40 rounded-xl font-semibold text-zinc-400 hover:text-white transition-all duration-200"
          >
            Learn More
          </a>
        </div>

        <p className="mt-10 text-xs text-zinc-700">18+ only &middot; All activity monitored for compliance</p>
      </div>
    </div>
  );
}
