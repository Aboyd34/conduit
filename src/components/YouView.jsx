import React, { useEffect, useState } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

function getAgeToken() {
  return localStorage.getItem('conduit_age_token') || ''
}

export default function YouView({ profileId, onBack }) {
  const [profile, setProfile] = useState(null)
  const [aeth, setAeth] = useState(null)
  const [loading, setLoading] = useState(true)

  const pubkey = profileId || localStorage.getItem('conduit_pubkey')

  useEffect(() => {
    if (!pubkey) { setLoading(false); return }
    const headers = { 'x-age-token': getAgeToken() }
    Promise.all([
      fetch(`${API}/api/profile/${encodeURIComponent(pubkey)}`, { headers }).then(r => r.ok ? r.json() : null),
      fetch(`${API}/api/profile/${encodeURIComponent(pubkey)}/aeth`, { headers }).then(r => r.ok ? r.json() : null)
    ]).then(([prof, aethData]) => {
      setProfile(prof)
      setAeth(aethData)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [pubkey])

  if (loading) return <div style={wrap}><div style={spinner} /></div>

  if (!pubkey) return (
    <div style={wrap}>
      <p style={{ color: '#94a3b8' }}>No identity found. Generate your keys in Settings.</p>
    </div>
  )

  const display = profile?.display_name || pubkey.slice(0, 12) + '…'
  const bio = profile?.bio || 'No bio yet.'
  const balance = aeth?.balance ?? 0
  const pioneer = !!aeth?.pioneer
  const ledger = aeth?.ledger || []

  return (
    <div style={wrap}>
      {onBack && (
        <button onClick={onBack} style={backBtn}>← Back</button>
      )}

      {/* Profile Card */}
      <div style={card}>
        <div style={avatar}>{display[0]?.toUpperCase() || '?'}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={nameStyle}>{display}</span>
            {pioneer && (
              <span style={pioneerBadge}>⚡ Pioneer</span>
            )}
          </div>
          <p style={bioStyle}>{bio}</p>
          <p style={{ color: '#475569', fontSize: 11, wordBreak: 'break-all', margin: 0 }}>{pubkey}</p>
        </div>
      </div>

      {/* AETH Balance */}
      <div style={aethCard}>
        <div style={aethHeader}>
          <span style={aethLabel}>⚡ AETH Balance</span>
          {pioneer && <span style={pioneerBadge}>2× Pioneer Multiplier Active</span>}
        </div>
        <div style={aethBalance}>{balance.toLocaleString()}</div>
        <div style={{ color: '#64748b', fontSize: 12 }}>Cap: 50,000 AETH · {pioneer ? 'Pioneer bonuses active' : 'Join before Jun 2026 for Pioneer status'}</div>
      </div>

      {/* Ledger */}
      {ledger.length > 0 && (
        <div style={ledgerCard}>
          <div style={aethLabel}>Recent Earnings</div>
          {ledger.slice(0, 8).map((entry, i) => (
            <div key={i} style={ledgerRow}>
              <span style={{ color: '#a78bfa' }}>+{entry.amount}</span>
              <span style={{ color: '#94a3b8', flex: 1, marginLeft: 12 }}>{entry.reason.replace(/_/g, ' ')}</span>
              <span style={{ color: '#475569', fontSize: 11 }}>{new Date(entry.timestamp).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const wrap = { padding: '24px 20px', maxWidth: 640, margin: '0 auto', color: '#e2e8f0' }
const card = {
  display: 'flex', gap: 16, alignItems: 'flex-start',
  background: 'linear-gradient(135deg,#0f0e1a,#16142a)',
  border: '1px solid #2d2a4a', borderRadius: 14, padding: '20px 24px', marginBottom: 16
}
const avatar = {
  width: 56, height: 56, borderRadius: '50%',
  background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 24, fontWeight: 800, color: '#fff', flexShrink: 0
}
const nameStyle = { color: '#e2e8f0', fontSize: 20, fontWeight: 700 }
const bioStyle = { color: '#94a3b8', fontSize: 14, margin: '4px 0 8px' }
const pioneerBadge = {
  background: 'linear-gradient(135deg,#7c3aed22,#f59e0b22)',
  border: '1px solid #f59e0b66',
  color: '#fbbf24', fontSize: 11, fontWeight: 700,
  padding: '2px 10px', borderRadius: 20, letterSpacing: 0.5
}
const aethCard = {
  background: 'linear-gradient(135deg,#0f0e1a,#1a1040)',
  border: '1px solid #3b3560', borderRadius: 14, padding: '20px 24px', marginBottom: 16
}
const aethHeader = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 8 }
const aethLabel = { color: '#a78bfa', fontWeight: 700, fontSize: 14 }
const aethBalance = { fontSize: 42, fontWeight: 800, color: '#7c3aed', lineHeight: 1, marginBottom: 4 }
const ledgerCard = {
  background: '#0f0e1a', border: '1px solid #2d2a4a',
  borderRadius: 14, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8
}
const ledgerRow = { display: 'flex', alignItems: 'center', fontSize: 13 }
const backBtn = {
  background: 'none', border: '1px solid #2d2a4a', borderRadius: 8,
  color: '#a78bfa', padding: '6px 14px', cursor: 'pointer', marginBottom: 16, fontSize: 13
}
const spinner = {
  width: 32, height: 32, border: '3px solid #2d2a4a',
  borderTop: '3px solid #7c3aed', borderRadius: '50%',
  animation: 'spin 0.8s linear infinite', margin: '80px auto'
}
