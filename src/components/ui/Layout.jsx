import React from 'react'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col relative">

      {/* grid bg */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="grid grid-cols-[220px_1fr_260px] flex-1 relative z-10">

        <aside className="p-5 bg-glass backdrop-blur-md border-r border-border">
          <h3 className="mb-3 text-textDim text-xs uppercase tracking-widest">
            Modules
          </h3>
          <div className="space-y-1 text-sm">
            <button className="block w-full text-left text-textDim hover:bg-white/5 hover:text-textMain px-2 py-2 rounded-lg transition">
              Terminal
            </button>
            <button className="block w-full text-left text-textDim hover:bg-white/5 hover:text-textMain px-2 py-2 rounded-lg transition">
              Repos
            </button>
          </div>
        </aside>

        <main className="p-6 overflow-y-auto">
          {children}
        </main>

        <aside className="p-5 bg-glass backdrop-blur-md border-l border-border">
          <h3 className="mb-3 text-textDim text-xs uppercase tracking-widest">
            Live Signals
          </h3>
        </aside>

      </div>
    </div>
  )
}
