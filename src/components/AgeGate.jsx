import React, { useState } from 'react'

const AGE_KEY = 'conduit_age_verified'

function buildAgeToken() {
  const timestamp = Date.now()
  const salt = Math.random().toString(36).slice(2)
  return JSON.stringify({ verified: true, timestamp, salt, sig: btoa(`conduit:${timestamp}:${salt}`) })
}

export default function AgeGate({ onVerify }) {
  const [checked, setChecked] = useState(false)
  const [error, setError] = useState('')
  const [dob, setDob] = useState('')

  function verify() {
    setError('')
    if (!dob) { setError('Please enter your date of birth.'); return }
    const birth = new Date(dob)
    const age = (Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    if (age < 18) { setError('You must be 18 or older to access Conduit.'); return }
    if (!checked) { setError('Please confirm you agree to the Terms of Service.'); return }
    const token = buildAgeToken()
    localStorage.setItem(AGE_KEY, token)
    localStorage.setItem('conduit_age_token', token)
    onVerify()
  }

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={logo}>⚡ CONDUIT</div>
        <h2 style={title}>Age Verification</h2>
        <p style={sub}>You must be 18 or older to access this platform.</p>

        <label style={label}>Date of Birth</label>
        <input
          type="date"
          value={dob}
          onChange={e => setDob(e.target.value)}
          max={new Date(Date.now() - 18 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
          style={input}
        />

        <div style={checkRow}>
          <input
            type="checkbox"
            id="tos"
            checked={checked}
            onChange={e => setChecked(e.target.checked)}
            style={{ width: 18, height: 18, accentColor: '#7c3aed', cursor: 'pointer' }}
          />
          <label htmlFor="tos" style={{ color: '#a78bfa', fontSize: 13, cursor: 'pointer' }}>
            I agree to the{' '}
            <a href="/privacy-policy.html" target="_blank" style={{ color: '#c4b5fd' }}>Terms of Service</a>
            {' '}and confirm I am 18+
          </label>
        </div>

        {error && <div style={errorBox}>{error}</div>}

        <button onClick={verify} style={btn}>Enter Conduit</button>

        <p style={disclaimer}>
          By entering you confirm you are of legal age in your jurisdiction.
          Age tokens are stored locally and never transmitted to our servers.
        </p>
      </div>
    </div>
  )
}

const overlay = {
  position: 'fixed', inset: 0, zIndex: 9999,
  background: 'rgba(7,6,15,0.97)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 16
}
const modal = {
  background: 'linear-gradient(135deg,#0f0e1a,#16142a)',
  border: '1px solid #2d2a4a', borderRadius: 16,
  padding: '40px 36px', maxWidth: 420, width: '100%',
  boxShadow: '0 24px 64px rgba(124,58,237,0.25)',
  display: 'flex', flexDirection: 'column', gap: 14
}
const logo = { color: '#7c3aed', fontSize: 22, fontWeight: 800, letterSpacing: 3, textAlign: 'center' }
const title = { color: '#e2e8f0', fontSize: 22, fontWeight: 700, margin: 0, textAlign: 'center' }
const sub = { color: '#94a3b8', fontSize: 14, margin: 0, textAlign: 'center' }
const label = { color: '#a78bfa', fontSize: 13, fontWeight: 600 }
const input = {
  width: '100%', padding: '10px 14px', borderRadius: 8,
  background: '#1e1c30', border: '1px solid #3b3560',
  color: '#e2e8f0', fontSize: 15, outline: 'none', boxSizing: 'border-box'
}
const checkRow = { display: 'flex', alignItems: 'flex-start', gap: 10 }
const errorBox = {
  background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
  borderRadius: 8, padding: '10px 14px', color: '#f87171', fontSize: 13
}
const btn = {
  padding: '13px', borderRadius: 10, border: 'none',
  background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
  color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer', marginTop: 4
}
const disclaimer = {
  color: '#475569', fontSize: 11, textAlign: 'center', lineHeight: 1.5, margin: 0
}
