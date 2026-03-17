export default function PostCard({ post = {} }) {
  const { alias = "Abc12..Xyz9", time = "now", text = "Signal incoming.", signals = 0 } = post;
  return (
    <div className="bg-panel border border-zinc-800 rounded-xl p-4 hover:border-accent/35 hover:shadow-lg hover:shadow-accent/10 transition-all group">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-1.5 h-1.5 rounded-full bg-signal pulse" />
        <span className="text-xs text-zinc-500 font-mono">◎ {alias}</span>
        <span className="text-xs text-zinc-700 ml-auto">{time} ago</span>
      </div>
      <p className="text-sm text-zinc-200 leading-relaxed">{text}</p>
      <div className="mt-3 flex gap-5 text-xs text-zinc-600">
        <button className="flex items-center gap-1 hover:text-signal transition-colors">
          <span>↑</span> signal <span className="text-zinc-700">({signals})</span>
        </button>
        <button className="hover:text-accent transition-colors">⟳ amplify</button>
        <button className="hover:text-zinc-300 transition-colors">↩ reply</button>
        <button className="hover:text-red-400 transition-colors ml-auto">🚩 report</button>
      </div>
    </div>
  );
}
