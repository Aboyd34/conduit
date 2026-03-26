import React, { useState } from 'react'

// ─── Simulated AETH token check
// In production: call your smart contract / API to verify real balance
const AETH_KEY = 'conduit_aeth_verified'

export function isAethVerified() {
  return localStorage.getItem(AETH_KEY) === 'true'
}

export function clearAethVerification() {
  localStorage.removeItem(AETH_KEY)
}

export default function AetherGate({ onVerified, onDismiss }) {
  const [step, setStep]         = useState('connect')  // connect | verify | success
  const [address, setAddress]   = useState('')
  const [balance, setBalance]   = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  // Simulate wallet connection
  function connectWallet() {
    setLoading(true)
    setTimeout(() => {
      // Simulated wallet address
      const addr = '0x' + Math.random().toString(16).slice(2,12) + '...'
      setAddress(addr)
      setStep('verify')
      setLoading(false)
    }, 1200)
  }

  // Simulate AETH balance check
  function checkBalance() {
    setLoading(true)
    setError('')
    setTimeout(() => {
      // Simulated: 70% chance of having AETH (demo)
      const held = Math.random() > 0.3
      const amount = held ? (Math.floor(Math.random() * 9000) + 100) : 0
      setBalance(amount)
      if (held) {
        localStorage.setItem(AETH_KEY, 'true')
        setStep('success')
        setTimeout(() => onVerified(amount), 1500)
      } else {
        setError('No AETH tokens detected in this wallet. You need AETH to access #aether.')
      }
      setLoading(false)
    }, 1500)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(7,6,15,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{
        background: 'linear-gradient(135deg,#0f0e1a,#1a1608)',
        border: '1px solid rgba(255,215,0,0.2)', borderRadius: 18,
        padding: '36px 32px', maxWidth: 420, width: '100%',
        boxShadow: '0 24px 64px rgba(255,215,0,0.1)',
        display: 'flex', flexDirection: 'column', gap: 20, textAlign: 'center',
      }}>
        <div style={{ fontSize: 32 }}>⚡</div>
        <div>
          <div style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 900, color: '#ffd700', letterSpacing: 2 }}>AETHER GATE</div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 6, fontFamily: 'monospace' }}>#aether is for AETH token holders only</p>
        </div>

        {step === 'connect' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0 }}>
              Connect your wallet to verify your AETH holdings and unlock exclusive access.
            </p>
            <button onClick={connectWallet} disabled={loading} style={{ padding: '13px', borderRadius: 10, border: 'none', background: loading ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg,#b8860b,#ffd700)', color: loading ? 'rgba(255,255,255,0.3)' : '#07060f', fontWeight: 800, fontSize: 14, cursor: loading ? 'default' : 'pointer', fontFamily: 'monospace', letterSpacing: 1 }}>
              {loading ? 'Connecting…' : '🦊 Connect Wallet'}
            </button>
            <button onClick={onDismiss} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace' }}>Cancel</button>
          </div>
        )}

        {step === 'verify' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 8, padding: '10px 14px' }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', marginBottom: 4 }}>CONNECTED WALLET</div>
              <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#ffd700', fontWeight: 700 }}>{address}</div>
            </div>
            {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', color: '#f87171', fontSize: 12 }}>{error}</div>}
            <button onClick={checkBalance} disabled={loading} style={{ padding: '13px', borderRadius: 10, border: 'none', background: loading ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg,#b8860b,#ffd700)', color: loading ? 'rgba(255,255,255,0.3)' : '#07060f', fontWeight: 800, fontSize: 14, cursor: loading ? 'default' : 'pointer', fontFamily: 'monospace', letterSpacing: 1 }}>
              {loading ? 'Checking balance…' : 'Verify AETH Holdings'}
            </button>
            <button onClick={onDismiss} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace' }}>Cancel</button>
          </div>
        )}

        {step === 'success' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 40 }}>✨</div>
            <div style={{ fontFamily: 'monospace', color: '#ffd700', fontWeight: 700 }}>AETH Verified!</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{balance?.toLocaleString()} AETH detected. Unlocking #aether…</div>
          </div>
        )}
      </div>
    </div>
  )
}
