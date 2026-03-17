import PostCard from "./PostCard";

const DEMO_POSTS = [
  { id: 1, alias: "Vx7r..K3mZ", time: "2m",  text: "Zero-knowledge systems are becoming viable at scale. The next wave of privacy infra is here.", signals: 42 },
  { id: 2, alias: "Qp2f..A9wL", time: "5m",  text: "End-to-end encryption alone isn't enough. Metadata reveals more than content ever could.", signals: 27 },
  { id: 3, alias: "Jk8n..R1xD", time: "11m", text: "Conduit makes surveillance obsolete. Build systems that work without trusting anyone.", signals: 18 },
];

export default function Feed() {
  return (
    <div className="flex-1 flex flex-col min-w-0 border-r border-zinc-800 overflow-hidden">
      {/* Compose */}
      <div className="p-4 border-b border-zinc-800 flex-shrink-0">
        <div className="bg-bg border border-zinc-800 rounded-xl px-4 py-2.5 flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-signal pulse flex-shrink-0" />
          <input
            type="text"
            placeholder="Broadcast a signal..."
            className="bg-transparent flex-1 text-sm text-zinc-300 placeholder:text-zinc-700 outline-none"
          />
          <button className="text-xs bg-accent/15 border border-accent/30 text-accent px-3 py-1 rounded-lg hover:bg-accent/25 transition-all">
            Send
          </button>
        </div>
      </div>
      {/* Feed */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {DEMO_POSTS.map(p => <PostCard key={p.id} post={p} />)}
      </div>
    </div>
  );
}
