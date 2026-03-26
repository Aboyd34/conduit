import React, { useState } from 'react'
import { saveProfile } from './UserProfile.jsx'

const ROOMS_PREVIEW = [
  { id: 'general', label: '#general', color: '#5b8cff', desc: 'Open signals — everyone welcome' },
  { id: 'dev',     label: '#dev',     color: '#9b5cff', desc: 'Builders, code, raw ideas' },
  { id: 'privacy', label: '#privacy', color: '#00ffc3', desc: 'Encryption, opsec, right to hide' },
  { id: 'aether',  label: '#aether',  color: '#ffd700', desc: 'AETH holders only' },
  { id: 'random',  label: '#random',  color: '#ff6b6b', desc: 'Noise, sparks, off-topic' },
]

export default function Onboarding({ session, onFinish }) {
  const [step, setStep]         = useState(0) // 0=welcome 1=handle 2=rooms 3=done
  const [handle, setHandle]     = useState('')
  const [picked, setPicked]     = useState(['general'])
  const [animOut, setAnimOut]   = useState(false)

  const fp = session?.fingerprint || ''

  function next() {
    if (step === 1 && handle.trim()) {
      saveProfile(fp, { handle: handle.trim().replace(/\s/g,'').slice(0,24), bio: '' })
    }
    if (step < 3) {
      setAnimOut(true)
      setTimeout(() => { setStep(s => s + 1); setAnimOut(false) }, 250)
    } else {
      onFinish()
    }
  }

  function toggleRoom(id) {
    setPicked(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id])
  }

  const steps = [
    // Step 0 — Welcome
    <div key={0} style={stepWrap}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>⚡</div>
      <h1 style={heading}>Welcome to Conduit.</h1>
      <p style={sub}>No email. No phone number. No real name.</p>
      <p style={sub}>Just your Signal Key and the network.</p>
      <div style={keyBox}>
        <span style={keyLabel}>Your Signal Key</span>
        <span style={keyFp}>{fp}</span>
      </div>
      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', textAlign: 'center', lineHeight: 1.6, maxWidth: 300 }}>
        This is your identity. Save it. It cannot be recovered if lost.
      </p>
      <button onClick={next} style={ctaBtn}>Get Started →</button>
    </div>,

    // Step 1 — Handle
    <div key={1} style={stepWrap}>
      <div style={{ fontSize: 40, marginBottom: 14 }}>👤</div>
      <h2 style={heading}>Set your handle.</h2>
      <p style={sub}>This is how the network knows you. No spaces. Max 24 chars.</p>
      <input
        value={handle}
        onChange={e => setHandle(e.target.value.replace(/\s/g,'').slice(0,24))}
        placeholder="your_handle"
        autoFocus
        style={inputStyle}
      />
      {handle && (
        <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#a78bfa', marginBottom: 20 }}>
          @{handle}
        </div>
      )}
      <button onClick={next} disabled={!handle.trim()} style={{ ...ctaBtn, opacity: handle.trim() ? 1 : 0.4 }}>
        {handle.trim() ? 'Continue →' : 'Enter a handle first'}
      </button>
      <button onClick={next} style={skipBtn}>Skip for now</button>
    </div>,

    // Step 2 — Pick rooms
    <div key={2} style={stepWrap}>
      <div style={{ fontSize: 40, marginBottom: 14 }}>📶</div>
      <h2 style={heading}>Pick your rooms.</h2>
      <p style={sub}>Choose which channels to follow. You can change this anytime.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 340, marginBottom: 24 }}>
        {ROOMS_PREVIEW.map(r => (
          <button key={r.id} onClick={() => toggleRoom(r.id)} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
            borderRadius: 12, border: `1px solid ${picked.includes(r.id) ? r.color : 'rgba(255,255,255,0.08)'}`,
            background: picked.includes(r.id) ? `${r.color}12` : 'rgba(255,255,255,0.02)',
            cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: picked.includes(r.id) ? r.color : 'rgba(255,255,255,0.15)', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'monospace', fontSize: 13, color: picked.includes(r.id) ? r.color : 'rgba(255,255,255,0.5)', fontWeight: 700 }}>{r.label}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>{r.desc}</div>
            </div>
            {picked.includes(r.id) && <span style={{ fontSize: 14, color: r.color }}>✓</span>}
          </button>
        ))}
      </div>
      <button onClick={next} style={ctaBtn}>Enter the Network →</button>
    </div>,

    // Step 3 — Done
    <div key={3} style={stepWrap}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>🌐</div>
      <h2 style={heading}>Signal locked in.</h2>
      <p style={sub}>You're now part of the network.</p>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', textAlign: 'center', lineHeight: 1.7, maxWidth: 300, marginBottom: 28 }}>
        Post signals. Earn AETH. Stay anonymous. The frequency is live.
      </p>
      <button onClick={onFinish} style={ctaBtn}>Open Conduit ⚡</button>
    </div>,
  ]

  return (
    <div style={{
      minHeight: '100vh', background: '#07060f',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 24, position: 'relative', overflow: 'hidden',
    }}>
      {/* Purple glow */}
      <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 500, height: 300, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(124,58,237,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Step dots */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 40, position: 'relative', zIndex: 1 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ width: i === step ? 20 : 6, height: 6, borderRadius: 3, background: i === step ? '#7c3aed' : i < step ? '#a78bfa' : 'rgba(255,255,255,0.1)', transition: 'all 0.3s' }} />
        ))}
      </div>

      <div style={{ opacity: animOut ? 0 : 1, transform: animOut ? 'translateY(10px)' : 'translateY(0)', transition: 'all 0.25s', width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        {steps[step]}
      </div>
    </div>
  )
}

const stepWrap  = { display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#e2e8f0' }
const heading   = { fontFamily: 'monospace', fontSize: 'clamp(20px,5vw,28px)', fontWeight: 900, color: '#fff', textAlign: 'center', margin: '0 0 10px' }
const sub       = { fontSize: 14, color: 'rgba(255,255,255,0.4)', textAlign: 'center', lineHeight: 1.6, margin: '0 0 8px' }
const ctaBtn    = { marginTop: 8, padding: '13px 32px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'monospace', letterSpacing: 1, boxShadow: '0 4px 20px rgba(124,58,237,0.35)' }
const skipBtn   = { marginTop: 8, background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace' }
const inputStyle = { width: '100%', maxWidth: 300, boxSizing: 'border-box', padding: '11px 14px', background: '#1e1c30', border: '1px solid #3b3560', borderRadius: 10, color: '#e2e8f0', fontSize: 15, outline: 'none', fontFamily: 'monospace', textAlign: 'center', marginBottom: 16 }
const keyBox    = { background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, width: '100%', maxWidth: 340, textAlign: 'center' }
const keyLabel  = { display: 'block', fontSize: 9, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', letterSpacing: 2, marginBottom: 6 }
const keyFp     = { fontSize: 11, fontFamily: 'monospace', color: '#a78bfa', wordBreak: 'break-all' }
