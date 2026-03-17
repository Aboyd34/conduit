const TOOLS = [
  { icon: "⊞",  label: "Terminal",   hint: "Encrypted CLI" },
  { icon: "📝", label: "Code Share",  hint: "E2E snippet share" },
  { icon: "🔐", label: "Vault",       hint: "Encrypted files" },
  { icon: "🌐", label: "Mesh",        hint: "P2P bridge" },
];

export default function ToolsPanel() {
  return (
    <div className="w-52 bg-panel border-r border-zinc-800 flex flex-col flex-shrink-0">
      <div className="px-4 py-3 border-b border-zinc-800">
        <p className="text-xs font-semibold text-white">Tools</p>
        <p className="text-xs text-zinc-600 mt-0.5">Encrypted utilities</p>
      </div>
      <div className="flex flex-col gap-1 p-2 flex-1">
        {TOOLS.map(t => (
          <button key={t.label} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left w-full text-zinc-500 hover:bg-white/4 hover:text-zinc-200 transition-all group border border-transparent hover:border-zinc-800">
            <span className="text-base">{t.icon}</span>
            <div>
              <p className="text-xs font-medium text-zinc-300">{t.label}</p>
              <p className="text-xs text-zinc-700 group-hover:text-zinc-500">{t.hint}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
