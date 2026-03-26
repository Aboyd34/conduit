import React from 'react'

export default function Input({ className = '', ...props }) {
  return (
    <input
      {...props}
      className={`
        w-full
        px-3 py-2
        rounded-xl
        bg-surface
        border border-border
        text-textMain text-sm
        placeholder:text-textDim
        focus:outline-none
        focus:border-primary
        focus:ring-1
        focus:ring-primary
        transition
        ${className}
      `}
    />
  )
}
