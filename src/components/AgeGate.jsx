import { useState } from 'react'

const AGE_KEY = 'conduit_age_verified'

function generateKey() {
  try {
    const arr = new Uint8Array(16)
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(arr)
    } else {
      for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256)
    }
    return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('')
  } catch {
    return Date.now().toString(16) + Math.random().toString(16).slice(2)
  }
}

export default function AgeGate({ onVerify }) {
  const [checked, setChecked] = useState(false)
  const [agreed, setAgreed] = useState(false)

  function handleVerify() {
    if (!checked || !agreed) return
    try {
      const existing = JSON.parse(localStorage.getItem('conduit_identity') || 'null')
      if (!existing?.pubkey) {
        localStorage.setItem('conduit_identity', JSON.stringify({ pubkey: generateKey(), created: Date.now() }))
      }
    } catch {}
    localStorage.setItem(AGE_KEY, '1')
    onVerify()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(122,92,255,0.08) 0%, #07060f 65%)' }}>
      <div className="w-full max-w-md rounded-2xl p-8 text-center"
        style={{ background: '#0f0e1f', border: '1px solid #1e1e2e' }}>

        <h1 className="text-3xl font-bold mb-1 tracking-widest" style={{ fontFamily: 'Space Grotesk', color: '#7a5cff' }}>
          CONDUIT<span style={{ color: '#00ff9f' }}>.</span>
        </h1>
        <p className="text-sm mb-6" style={{ color: '#52525b' }}>Anonymous. Encrypted. Yours.</p>

        <div className="rounded-xl p-5 text-left mb-6" style={{ background: '#07060f', border: '1px solid #1e1e2e' }}>
          <h2 className="text-sm font-semibold mb-3">Before you enter</h2>
          <ul className="space-y-2 text-xs" style={{ color: '#52525b' }}>
            {[
              'You are 18 years of age or older',
              'Content is user-generated and peer-verified',
              'Your identity is local — no accounts, no servers',
              'Messages are cryptographically signed by your device'
            ].map(t => (
              <li key={t} className="flex gap-2">
                <span style={{ color: '#7a5cff' }}>⬡</span> {t}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs mb-4" style={{ color: '#7a5cff' }}>🔒 Local key generated on entry</p>

        {[{ val: checked, set: setChecked, label: 'I am 18 or older' }, { val: agreed, set: setAgreed, label: 'I agree to the terms of use' }].map(({ val, set, label }) => (
          <label key={label} className="flex items-center gap-2 justify-center mb-3 text-xs cursor-pointer" style={{ color: '#71717a' }}>
            <input type="checkbox" checked={val} onChange={e => set(e.target.checked)} />
            {label}
          </label>
        ))}

        <button
          onClick={handleVerify}
          disabled={!checked || !agreed}
          className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all mt-2"
          style={{
            background: (!checked || !agreed) ? '#1e1e2e' : 'linear-gradient(135deg,#7a5cff,#00d4ff)',
            opacity: (!checked || !agreed) ? 0.4 : 1,
            cursor: (!checked || !agreed) ? 'not-allowed' : 'pointer'
          }}
        >
          Enter Conduit
        </button>
        <p className="mt-4 text-xs leading-relaxed" style={{ color: '#3f3f46' }}>
          No personal data stored. Key generated locally, never transmitted.
        </p>
      </div>
    </div>
  )
}
