import React from 'react'
import Button from './Button'

export default function Header() {
  return (
    <header className="flex justify-between items-center px-6 py-4 backdrop-blur-md z-10 relative border-b border-border">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-signal rounded-full shadow-glow-signal" />
        <span className="tracking-[0.25em] text-xs text-textDim font-mono">
          CONDUIT
        </span>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-xs text-textDim">421 live</span>
        <Button>New Signal</Button>
      </div>
    </header>
  )
}
