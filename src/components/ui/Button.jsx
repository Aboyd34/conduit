import React from 'react'

export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base =
    'inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium transition transform duration-150 cursor-pointer'

  const styles = {
    primary:
      'bg-gradient-to-r from-primary to-secondary text-white hover:-translate-y-0.5 hover:shadow-glow',
    ghost:
      'text-textDim hover:bg-white/5 border border-transparent hover:border-border',
    danger:
      'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20',
  }

  return (
    <button className={`${base} ${styles[variant] || styles.primary} ${className}`} {...props}>
      {children}
    </button>
  )
}
