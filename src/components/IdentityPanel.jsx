import { useState, useEffect } from 'react'

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

function ensureIdentity() {
  try {
    const raw = localStorage.getItem('conduit_identity')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed?.pubkey) return parsed
    }
  } catch {}
  const id = { pubkey: generateKey(), created: Date.now() }
  try { localStorage.setItem('conduit_identity', JSON.stringify(id)) } catch {}
  return id
}

export default function IdentityPanel() {
  const [identity, setIdentity] = useState(null)

  useEffect(() => { setIdentity(ensureIdentity()) }, [])

  function rotate() {
    const id = { pubkey: generateKey(), created: Date.now() }
    try { localStorage.setItem('conduit_identity', JSON.stringify(id)) } catch {}
    setIdentity(id)
  }

  const short = identity?.pubkey
    ? identity.pubkey.slice(0, 4).toUpperCase() + '..' + identity.pubkey.slice(-4).toUpperCase()
    : 'LOADING...'

  const since = identity?.created ? new Date(identity.created).toLocaleDateString() : '—'

  return (
    <div className="flex flex-col flex-shrink-0" style={{ width: 216, background: '#0f0e1f' }}>
      <div className="px-4 py-3" style={{ borderBottom: '1px solid #1e1e2e' }}>
        <p className="text-xs font-semibold">Identity</p>
        <p className="text-xs mt-0.5" style={{ color: '#52525b' }}>Local only — never sent</p>
      </div>
      <div className="p-4 flex flex-col gap-4">
        {/* Key */}
        <div className="rounded-xl p-3" style={{ background: '#07060f', border: '1px solid #1e1e2e' }}>
          <p className="text-xs mb-1" style={{ color: '#52525b' }}>Fingerprint</p>
          <p className="text-sm font-bold tracking-widest" style={{ fontFamily: 'Space Grotesk', color: '#7a5cff' }}>{short}</p>
          <p className="text-xs mt-1" style={{ color: '#3f3f46' }}>Since {since}</p>
        </div>
        {/* Status */}
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full pulse" style={{ background: '#00ff9f' }} />
          <span className="text-xs" style={{ color: '#52525b' }}>Key active</span>
        </div>
        {/* Stats */}
        {[['Encryption','AES-256'],['Signing','Local only'],['Storage','Device only']].map(([l,v]) => (
          <div key={l} className="flex justify-between text-xs">
            <span style={{ color: '#52525b' }}>{l}</span>
            <span style={{ color: '#a1a1aa', fontFamily: 'Space Grotesk' }}>{v}</span>
          </div>
        ))}
        {/* Rotate */}
        <button onClick={rotate}
          className="w-full py-2 rounded-xl text-xs font-semibold transition-all mt-2"
          style={{ border: '1px solid rgba(122,92,255,0.25)', color: '#7a5cff', background: 'transparent', cursor: 'pointer' }}
          onMouseOver={e => e.currentTarget.style.background='rgba(122,92,255,0.1)'}
          onMouseOut={e => e.currentTarget.style.background='transparent'}
        >
          🔄 Rotate Key
        </button>
      </div>
    </div>
  )
}
