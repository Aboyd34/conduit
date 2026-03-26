import React from 'react'
import Card from './Card'
import Button from './Button'

function genId() {
  return Math.random().toString(36).substring(2, 10)
}

export default function Signal({ text }) {
  return (
    <Card>
      <div className="text-xs text-textDim font-mono mb-1">
        #{genId()}
      </div>

      <p className="text-sm text-textMain">{text}</p>

      <div className="flex gap-2 mt-3">
        <Button variant="ghost">Signal</Button>
        <Button variant="ghost">Amplify</Button>
        <Button variant="ghost">Reply</Button>
      </div>
    </Card>
  )
}
