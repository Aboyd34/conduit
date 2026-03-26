import React from 'react'

export default function RoomsView({ room, posts = [], tools = [], trending = [], resources = [], online = 0 }) {
  return (
    <div className="flex flex-col h-screen bg-bg text-textMain">

      {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-border">
        <h2 className="font-mono text-xl">#{room}</h2>
        <div className="flex items-center gap-4 text-sm text-cyan">
          <span>{online} online</span>
          <button className="hover:text-signal transition">Start Thread</button>
          <button className="hover:text-signal transition">Share</button>
        </div>
      </header>

      {/* GRID */}
      <div className="grid grid-cols-[240px_1fr_260px] flex-1 overflow-hidden">

        {/* TOOLS */}
        <aside className="bg-panel px-4 py-6 space-y-3 overflow-y-auto border-r border-border">
          <h3 className="font-mono text-xs text-cyan uppercase tracking-widest mb-3">Tools</h3>
          {tools.map(t => (
            <button
              key={t.id}
              className="w-full text-left px-3 py-2 bg-panel2 rounded-lg text-sm hover:bg-accent/20 transition"
            >
              {t.label}
            </button>
          ))}
        </aside>

        {/* FEED */}
        <main className="px-6 py-6 overflow-y-auto space-y-4">
          {posts.map(p => (
            <div key={p.id} className="bg-glass border border-border p-4 rounded-2xl backdrop-blur-md hover:border-primary hover:shadow-glow transition">
              <div className="text-xs font-mono text-textDim">{p.fingerprint}</div>
              <p className="mt-2 text-sm">{p.text}</p>
              <div className="flex gap-3 mt-3">
                <button className="text-xs text-textDim hover:text-signal transition px-2 py-1 rounded hover:bg-white/5">Signal</button>
                <button className="text-xs text-textDim hover:text-signal transition px-2 py-1 rounded hover:bg-white/5">Amplify</button>
                <button className="text-xs text-textDim hover:text-signal transition px-2 py-1 rounded hover:bg-white/5">Reply</button>
                <button className="text-xs text-textDim hover:text-signal transition px-2 py-1 rounded hover:bg-white/5">Recycle</button>
              </div>
            </div>
          ))}
        </main>

        {/* SIDEBAR */}
        <aside className="bg-panel px-4 py-6 space-y-6 overflow-y-auto border-l border-border">
          <div>
            <h3 className="font-mono text-xs text-cyan uppercase tracking-widest mb-3">Trending</h3>
            <ul className="space-y-1 text-sm text-textDim">
              {trending.map(t => <li key={t} className="hover:text-textMain cursor-pointer transition">{t}</li>)}
            </ul>
          </div>
          <div>
            <h3 className="font-mono text-xs text-cyan uppercase tracking-widest mb-3">Resources</h3>
            <ul className="space-y-1 text-sm text-textDim">
              {resources.map(r => <li key={r} className="hover:text-textMain cursor-pointer transition">{r}</li>)}
            </ul>
          </div>
        </aside>

      </div>
    </div>
  )
}
