import React, { useState } from 'react'

const ONBOARD_KEY = 'conduit_onboarded'

const STEPS = [
  {
    icon: '🔑',
    title: 'Your Keys. Your Identity.',
    body: 'Conduit generates a cryptographic keypair in your browser. No email, no password, no account — just you and your keys. Back them up; if you lose them, access is gone forever.'
  },
  {
    icon: '⚡',
    title: 'Earn AETH Tokens',
    body: 'Every post, reply, and signal you receive earns you AETH — Conduit\'s native token. Pioneer members (joined before June 2026) earn 2× on every action. Cap is 50,000 AETH.'
  },
  {
    icon: '🤖',
    title: 'Meet Aether',
    body: 'Aether is the AI built into Conduit, powered by Llama 3.3 70B via Groq. Tap the 🤖 tab anytime to ask questions, brainstorm, or get help. Conversations stay on your device.'
  }
]

export default function Onboarding({ onDone }) {
  const [step, setStep] = useState(0)

  function finish() {
    localStorage.setItem(ONBOARD_KEY, '1')
    onDone()
  }

  const s = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div style={overlay}>
      <div style={modal}>
        {/* Progress dots */}
        <div style={dots}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ ...dot, background: i <= step ? '#7c3aed' : '#2d2a4a' }} />
          ))}
        </div>

        <div style={iconWrap}>{s.icon}</div>
        <h2 style={title}>{s.title}</h2>
        <p style={body}>{s.body}</p>

        <div style={btnRow}>
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} style={backBtn}>← Back</button>
          )}
          <button
            onClick={isLast ? finish : () => setStep(step + 1)}
            style={nextBtn}
          >
            {isLast ? 'Enter Conduit ⚡' : 'Next →'}
          </button>
        </div>

        <button onClick={finish} style={skipBtn}>Skip intro</button>
      </div>
    </div>
  )
}

const overlay = {
  position: 'fixed', inset: 0, zIndex: 9998,
  background: 'rgba(7,6,15,0.98)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
}
const modal = {
  background: 'linear-gradient(135deg,#0f0e1a,#16142a)',
  border: '1px solid #2d2a4a', borderRadius: 20,
  padding: '44px 40px', maxWidth: 440, width: '100%',
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
  boxShadow: '0 24px 64px rgba(124,58,237,0.3)', textAlign: 'center'
}
const dots = { display: 'flex', gap: 8 }
const dot = { width: 8, height: 8, borderRadius: '50%', transition: 'background 0.3s' }
const iconWrap = { fontSize: 52, lineHeight: 1 }
const title = { color: '#e2e8f0', fontSize: 24, fontWeight: 800, margin: 0 }
const body = { color: '#94a3b8', fontSize: 15, lineHeight: 1.7, margin: 0, maxWidth: 360 }
const btnRow = { display: 'flex', gap: 12, width: '100%', marginTop: 8 }
const nextBtn = {
  flex: 1, padding: '13px', borderRadius: 10, border: 'none',
  background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
  color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer'
}
const backBtn = {
  padding: '13px 18px', borderRadius: 10,
  background: 'none', border: '1px solid #3b3560',
  color: '#a78bfa', fontWeight: 600, fontSize: 15, cursor: 'pointer'
}
const skipBtn = {
  background: 'none', border: 'none', color: '#475569',
  fontSize: 13, cursor: 'pointer', textDecoration: 'underline', padding: 0
}
