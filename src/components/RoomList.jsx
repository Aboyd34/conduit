const ROOMS = [
  { id: 1, name: "#general",    desc: "Open signal",         count: 24 },
  { id: 2, name: "#tech",       desc: "Dev & crypto",        count: 11 },
  { id: 3, name: "#alpha",      desc: "Vetted signals only", count: 7,  gated: true },
  { id: 4, name: "#darknet",    desc: "Onion-routed",        count: 3,  gated: true },
];

export default function RoomList() {
  return (
    <div className="w-56 bg-panel border-r border-zinc-800 flex flex-col flex-shrink-0">
      <div className="px-4 py-3 border-b border-zinc-800">
        <p className="text-xs font-semibold text-white">Rooms</p>
        <p className="text-xs text-zinc-600 mt-0.5">Live channels</p>
      </div>
      <div className="flex flex-col gap-0.5 p-2 flex-1 overflow-y-auto">
        {ROOMS.map(r => (
          <button key={r.id} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left w-full transition-all group ${
            r.id === 1
              ? "bg-cyan-500/8 border border-cyan-500/20 text-cyan-400"
              : "text-zinc-500 hover:bg-white/4 hover:text-zinc-200"
          } ${r.gated ? "border border-accent/15" : ""}`}>
            <span className="text-base flex-shrink-0">{r.gated ? "🔒" : "⚡"}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{r.name}</p>
              <p className="text-xs text-zinc-700 truncate group-hover:text-zinc-500">{r.desc}</p>
            </div>
            <span className="text-xs text-zinc-700 bg-white/5 px-1.5 py-0.5 rounded-full flex-shrink-0">{r.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
