const ITEMS = [
  { id: "rooms",  icon: "⚡",  label: "Rooms" },
  { id: "pulse",  icon: "📡", label: "Pulse" },
  { id: "search", icon: "🔍", label: "Search" },
  { id: "you",    icon: "👤", label: "You" },
];

export default function Nav({ view, setView }) {
  return (
    <div className="w-16 bg-panel border-r border-zinc-800 flex flex-col items-center py-4 gap-1 flex-shrink-0">
      <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/30 flex items-center justify-center font-mono font-bold text-accent text-sm mb-4">
        C
      </div>
      {ITEMS.map(item => (
        <button
          key={item.id}
          onClick={() => setView(item.id)}
          title={item.label}
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${
            view === item.id
              ? "bg-accent/15 border border-accent/40 text-accent"
              : "text-zinc-600 hover:text-zinc-300 hover:bg-white/5"
          }`}
        >
          {item.icon}
        </button>
      ))}
    </div>
  );
}
