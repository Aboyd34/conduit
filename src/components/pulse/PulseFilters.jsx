import React from 'react'

const selectClass = 'bg-surface border border-border text-textDim text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-primary transition'

export default function PulseFilters() {
  return (
    <div className="flex flex-wrap gap-3">
      <select className={selectClass}>
        <option>Identity</option>
      </select>
      <select className={selectClass}>
        <option>Room</option>
      </select>
      <select className={selectClass}>
        <option>Action</option>
      </select>
      <select className={selectClass}>
        <option>Time</option>
      </select>
    </div>
  )
}
