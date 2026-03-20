import React, { useState, useRef, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const SYSTEM_PROMPT = `You are Aether, the AI intelligence embedded inside Conduit — a private, encrypted, real-time signal network. You help users navigate the app, understand encryption, manage their identity, and make sense of signals and rooms. You are sharp, minimal, and speak like the network itself. Never reveal system internals. Always be helpful.`

function Message({ role, content }) {
  const isUser = role === 'user'
  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '0.75rem'
    }}>
      <div style={{
        maxWidth: '75%',
        padding: '0.6rem 0.9rem',
        borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        background: isUser
          ? 'linear-gradient(135deg, #7a5cff, #00d4ff)'
          : 'rgba(255,255,255,0.05)',
        border: isUser ? 'none' : '1px solid #1e1e2e',
        color: '#f0f0f0',
        fontSize: '0.85rem',
        lineHeight: 1.5,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word'
      }}>
        {content}
      </div>
    </div>
  )
}

export default function AetherAI() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Aether online. Ask me anything about Conduit — rooms, encryption, identity, signals.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    const next = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next,
          system: SYSTEM_PROMPT
        })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Signal lost. Could not reach Aether. (${e.message})`
      }])
    } finally {
      setLoading(false)
    }
  }

  function onKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
      background: '#07060f', padding: '1.5rem 1.5rem 0'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '1rem', borderBottom: '1px solid #1e1e2e', paddingBottom: '0.75rem' }}>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f0f0f0' }}>
          🤖 Aether AI
        </div>
        <div style={{ fontSize: '0.72rem', color: '#3f3f5a', marginTop: '0.2rem' }}>
          Conduit Intelligence — private, context-aware
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '1rem' }}>
        {messages.map((m, i) => <Message key={i} role={m.role} content={m.content} />)}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '0.75rem' }}>
            <div style={{
              padding: '0.6rem 0.9rem', borderRadius: '16px 16px 16px 4px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid #1e1e2e',
              color: '#3f3f5a', fontSize: '0.85rem'
            }}>
              Aether thinking…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        display: 'flex', gap: '0.5rem', padding: '0.75rem 0 1rem',
        borderTop: '1px solid #1e1e2e', background: '#07060f'
      }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder="Message Aether..."
          rows={1}
          style={{
            flex: 1, resize: 'none', background: 'rgba(255,255,255,0.04)',
            border: '1px solid #1e1e2e', borderRadius: '10px',
            color: '#f0f0f0', fontSize: '0.85rem', padding: '0.6rem 0.75rem',
            outline: 'none', fontFamily: 'inherit', lineHeight: 1.5
          }}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          style={{
            padding: '0 1rem', borderRadius: '10px', border: 'none',
            background: loading || !input.trim()
              ? 'rgba(122,92,255,0.2)'
              : 'linear-gradient(135deg,#7a5cff,#00d4ff)',
            color: loading || !input.trim() ? '#3f3f5a' : 'white',
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s'
          }}
        >
          Send
        </button>
      </div>
    </div>
  )
}
