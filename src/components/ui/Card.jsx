import React from 'react'

export default function Card({ children, className = '' }) {
  return (
    <div
      className={`
        bg-glass
        border border-border
        rounded-2xl
        p-4
        backdrop-blur-md
        hover:border-primary
        hover:shadow-glow
        transition
        duration-150
        ${className}
      `}
    >
      {children}
    </div>
  )
}
