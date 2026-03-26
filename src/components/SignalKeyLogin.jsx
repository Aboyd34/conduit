import React, { useState, useEffect } from 'react'

// ─── Key Storage ──────────────────────────────────────────────────────────────
const STORAGE_KEY = 'conduit_signal_key'
const ROLE_KEY    = 'conduit_user_role'

// Admin fingerprint — hardcoded for you (owner).
// Change ADMIN_KEY to your own secret passphrase.
const ADMIN_KEY = 'CONDUIT-ADMIN-MASTER'

const WORD_BANK = [
  'phantom','signal','cipher','nova','relay','forge','null','static',
  'aether','pulse','ghost','vector','nexus','echo','arc','volt',
  'drift','orbit','flux','zenith','quasar','prism','veil','node',
  'storm','ember','rune','shard','tide','void',
]

function generateKey() {
  const pick = () => WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)]
  const num  = () => Math.floor(Math.random() * 900 + 100)
  return `${pick()}-${pick()}-${num()}`
}

function deriveFingerprint(key) {
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i)
    hash |= 0
  }
  const h = Math.abs(hash).toString(16).padStart(8, '0')
  return `${h.slice(0,4)}·${h.slice(4,8)}`
}

function saveSession(key, role) {
  localStorage.setItem(STORAGE_KEY, key)
  localStorage.setItem(ROLE_KEY, role)
}

export function loadSession() {
  const key  = localStorage.getItem(STORAGE_KEY)
  const role = localStorage.getItem(ROLE_KEY) || 'user'
  return key ? { key, role, fingerprint: deriveFingerprint(key) } : null
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(ROLE_KEY)
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconCopy    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
const IconRefresh = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
const IconEye     = ({ open }) => open
  ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
  : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SignalKeyLogin({ onLogin }) {
  const [tab, setTab]           = useState('new')   // 'new' | 'existing'
  const [genKey, setGenKey]     = useState(() => generateKey())
  const [inputKey, setInputKey] = useState('')
  const [showKey, setShowKey]   = useState(false)
  const [copied, setCopied]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [error, setError]       = useState('')
  const [agreed, setAgreed]     = useState(false)

  const fingerprint = deriveFingerprint(tab === 'new' ? genKey : inputKey)

  function handleCopy() {
    navigator.clipboard.writeText(genKey).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleEnter() {
    setError('')
    if (tab === 'new') {
      if (!saved) { setError('Please confirm you have saved your Signal Key.'); return }
      if (!agreed) { setError('Please agree to the Terms before entering.'); return }
      const role = genKey.trim().toUpperCase() === ADMIN_KEY ? 'admin' : 'user'
      saveSession(genKey, role)
      onLogin({ key: genKey, role, fingerprint: deriveFingerprint(genKey) })
    } else {
      const k = inputKey.trim()
      if (!k) { setError('Enter your Signal Key.'); return }
      const role = k.toUpperCase() === ADMIN_KEY ? 'admin' : 'user'
      saveSession(k, role)
      onLogin({ key: k, role, fingerprint: deriveFingerprint(k) })
    }
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>

        {/* Logo */}
        <div style={styles.logoRow}>
          <span style={styles.bolt}>⚡</span>
          <span style={styles.logoText}>CONDUIT</span>
        </div>
        <p style={styles.tagline}>Decentralized. Private. Yours.</p>

        {/* Tabs */}
        <div style={styles.tabs}>
          {['new', 'existing'].map(t => (
            <button key={t} onClick={() => { setTab(t); setError('') }} style={{
              ...styles.tab,
              ...(tab === t ? styles.tabActive : {}),
            }}>
              {t === 'new' ? '⚡ New Identity' : '🔑 Return Signal'}
            </button>
          ))}
        </div>

        {/* ── NEW IDENTITY ── */}
        {tab === 'new' && (
          <div style={styles.section}>
            <p style={styles.hint}>Your Signal Key is your identity on Conduit. No email. No password. Just your key.</p>

            {/* Generated key display */}
            <div style={styles.keyBox}>
              <span style={styles.keyText}>{genKey}</span>
              <div style={styles.keyActions}>
                <button onClick={handleCopy} title="Copy" style={styles.iconBtn}>
                  <IconCopy />{copied ? ' Copied!' : ''}
                </button>
                <button onClick={() => setGenKey(generateKey())} title="Regenerate" style={styles.iconBtn}>
                  <IconRefresh />
                </button>
              </div>
            </div>

            {/* Fingerprint preview */}
            <div style={styles.fpRow}>
              <span style={styles.fpLabel}>Your fingerprint:</span>
              <span style={styles.fp}>{fingerprint}</span>
            </div>

            {/* Warning */}
            <div style={styles.warning}>
              ⚠️ <strong>Save this key.</strong> There is no recovery. If you lose it, your identity is gone.
            </div>

            {/* Confirm saved */}
            <label style={styles.checkRow}>
              <input type="checkbox" checked={saved} onChange={e => setSaved(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: '#7c3aed', cursor: 'pointer' }} />
              <span style={styles.checkLabel}>I have saved my Signal Key somewhere safe</span>
            </label>

            {/* ToS */}
            <label style={styles.checkRow}>
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: '#7c3aed', cursor: 'pointer' }} />
              <span style={styles.checkLabel}>I am 18+ and agree to the <a href="/privacy-policy.html" target="_blank" rel="noreferrer" style={{ color: '#c4b5fd' }}>Terms of Service</a></span>
            </label>
          </div>
        )}

        {/* ── EXISTING KEY ── */}
        {tab === 'existing' && (
          <div style={styles.section}>
            <p style={styles.hint}>Enter the Signal Key you saved when you first joined Conduit.</p>

            <label style={styles.label}>Signal Key</label>
            <div style={styles.inputWrap}>
              <input
                type={showKey ? 'text' : 'password'}
                value={inputKey}
                onChange={e => { setInputKey(e.target.value); setError('') }}
                placeholder="e.g. phantom-nova-447"
                onKeyDown={e => e.key === 'Enter' && handleEnter()}
                style={styles.input}
                autoComplete="off"
                spellCheck={false}
              />
              <button onClick={() => setShowKey(s => !s)} style={styles.eyeBtn}>
                <IconEye open={showKey} />
              </button>
            </div>

            {inputKey.trim() && (
              <div style={styles.fpRow}>
                <span style={styles.fpLabel}>Fingerprint preview:</span>
                <span style={styles.fp}>{fingerprint}</span>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && <div style={styles.error}>{error}</div>}

        {/* CTA */}
        <button onClick={handleEnter} style={styles.cta}>
          {tab === 'new' ? 'Generate & Enter Conduit' : 'Enter Conduit'}
        </button>

        <p style={styles.disclaimer}>
          Signal Keys are stored locally and never sent to our servers.
        </p>
      </div>
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 9999,
    background: 'rgba(7,6,15,0.97)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
  },
  card: {
    background: 'linear-gradient(135deg,#0f0e1a,#16142a)',
    border: '1px solid #2d2a4a', borderRadius: 18,
    padding: '36px 32px', maxWidth: 440, width: '100%',
    boxShadow: '0 24px 64px rgba(124,58,237,0.22)',
    display: 'flex', flexDirection: 'column', gap: 16,
  },
  logoRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
  bolt:    { fontSize: 28 },
  logoText:{ color: '#7c3aed', fontSize: 22, fontWeight: 900, letterSpacing: 4, fontFamily: 'monospace' },
  tagline: { color: '#475569', fontSize: 12, textAlign: 'center', margin: 0, fontFamily: 'monospace', letterSpacing: 1 },
  tabs:    { display: 'flex', gap: 8 },
  tab: {
    flex: 1, padding: '9px 0', borderRadius: 9,
    border: '1px solid rgba(255,255,255,0.07)',
    background: 'transparent', color: 'rgba(255,255,255,0.35)',
    fontSize: 12, fontWeight: 600, cursor: 'pointer',
    fontFamily: 'monospace', transition: 'all 0.15s',
  },
  tabActive: {
    background: 'rgba(124,58,237,0.15)',
    border: '1px solid rgba(124,58,237,0.4)',
    color: '#c4b5fd',
  },
  section: { display: 'flex', flexDirection: 'column', gap: 12 },
  hint:    { color: '#94a3b8', fontSize: 13, margin: 0, lineHeight: 1.6 },
  keyBox: {
    background: '#0d0c1a', border: '1px solid #3b3560', borderRadius: 10,
    padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
  },
  keyText:   { fontFamily: 'monospace', fontSize: 17, fontWeight: 700, color: '#a78bfa', letterSpacing: 1, wordBreak: 'break-all' },
  keyActions:{ display: 'flex', gap: 6, flexShrink: 0 },
  iconBtn: {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 7, padding: '5px 9px', cursor: 'pointer',
    color: 'rgba(255,255,255,0.5)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4,
    fontFamily: 'monospace', transition: 'all 0.12s',
  },
  fpRow:  { display: 'flex', alignItems: 'center', gap: 8 },
  fpLabel:{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' },
  fp:     { fontSize: 11, color: '#7c3aed', fontFamily: 'monospace', fontWeight: 700, letterSpacing: 1 },
  warning:{
    background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)',
    borderRadius: 8, padding: '10px 14px',
    fontSize: 12, color: '#fbbf24', lineHeight: 1.5,
  },
  checkRow:  { display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' },
  checkLabel:{ color: '#94a3b8', fontSize: 13, lineHeight: 1.5 },
  label:     { color: '#a78bfa', fontSize: 13, fontWeight: 600 },
  inputWrap: { position: 'relative' },
  input: {
    width: '100%', padding: '11px 42px 11px 14px', borderRadius: 9,
    background: '#1e1c30', border: '1px solid #3b3560',
    color: '#e2e8f0', fontSize: 15, outline: 'none',
    boxSizing: 'border-box', fontFamily: 'monospace', letterSpacing: 1,
  },
  eyeBtn: {
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'rgba(255,255,255,0.3)', padding: 4,
  },
  error: {
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: 8, padding: '10px 14px', color: '#f87171', fontSize: 13,
  },
  cta: {
    padding: '13px', borderRadius: 10, border: 'none',
    background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
    color: '#fff', fontWeight: 700, fontSize: 15,
    cursor: 'pointer', fontFamily: 'monospace', letterSpacing: 1,
    transition: 'opacity 0.15s',
  },
  disclaimer: { color: '#334155', fontSize: 11, textAlign: 'center', lineHeight: 1.5, margin: 0 },
}
