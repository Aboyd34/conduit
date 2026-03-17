const SIGNALS = [
  { tag: "#ZK",      text: "Zero-knowledge thread",     delta: "+14" },
  { tag: "#E2E",     text: "Encryption protocol debate",  delta: "+9" },
  { tag: "#Mesh",    text: "P2P routing breakthrough",    delta: "+7" },
  { tag: "#Privacy", text: "Browser fingerprint bypass",  delta: "+5" },
];

export default function IntelPanel() {
  return (
    <div className="w-60 bg-panel border-r border-zinc-800 flex flex-col flex-shrink-0">
      <div className="px-4 py-3 border-b border-zinc-800">
        <p className="text-xs font-semibold text-white">Trending Signals</p>
        <p className="text-xs text-zinc-600 mt-0.5">Live activity</p>
      </div>
      <div className="flex flex-col gap-1 p-2 flex-1 overflow-y-auto">
        {SIGNALS.map(s => (
          <div key={s.tag} className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-bg/60 border border-zinc-800/60">
            <span className="text-xs font-mono text-accent mt-0.5 flex-shrink-0">{s.tag}</span>
            <p className="text-xs text-zinc-400 flex-1 leading-relaxed">{s.text}</p>
            <span className="text-xs text-signal flex-shrink-0 font-semibold">{s.delta}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
