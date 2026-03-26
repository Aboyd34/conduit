import React, { useState } from 'react'
import { loadSession, clearSession } from './SignalKeyLogin.jsx'
import { getProfile, saveProfile, Avatar } from './UserProfile.jsx'

const FOUNDER_FP = 'CONDUIT-ADMIN-MASTER'

const FOUNDER_STATEMENT = `Conduit was built because privacy isn't a feature — it's a right.

Every platform wants your name, your email, your face. We said no.

Your identity here is a Signal Key. No database. No servers watching you.
Just you, your key, and the signal you put out.

I built Conduit for people who are tired of being the product.
For builders, thinkers, and anyone who believes the internet should be
owned by the people using it — not the companies monetizing them.

This is just the beginning. The signal is live.

— Founder, Conduit`

export default function YouView({ session, onLogout, posts = [] }) {
  const fp = session?.fingerprint || ''
  const role = session?.role || 'user'
  const isFounder = role === 'admin'

  const existing = getProfile(fp)
  const [handle, setHandle]   = useState(existing?.handle || '')
  const [bio, setBio]         = useState(existing?.bio || '')
  const [editing, setEditing] = useState(false)
  const [saved, setSaved]     = useState(false)
  const [showStatement, setShowStatement] = useState(false)
  const [copied, setCopied]   = useState(false)

  function saveEdits() {
    saveProfile(fp, { handle: handle.trim(), bio: bio.trim() })
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function copyKey() {
    navigator.clipboard.writeText(session?.key || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const myPosts = posts.filter(p => !p.removed)

  return (
    <div style={styles.wrap}>

      {/* ── HERO PROFILE CARD ── */}
      <div style={styles.heroCard}>
        {/* Glow ring behind avatar */}
        <div style={styles.avatarGlow}>
          <Avatar fingerprint={fp} handle={handle || fp} size={72} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Handle / name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={styles.handle}>{handle || <span style={styles.noHandle}>Set a handle →</span>}</span>
            {isFounder && <span style={styles.founderBadge}>★ Founder</span>}
            {role === 'moderator' && <span style={styles.modBadge}>🛡️ Mod</span>}
          </div>
          {/* Bio */}
          {bio && !editing && <p style={styles.bio}>{bio}</p>}
          {/* Fingerprint */}
          <div style={styles.fpRow}>
            <span style={styles.fp}>{fp}</span>
          </div>
        </div>
      </div>

      {/* ── EDIT PROFILE ── */}
      {editing ? (
        <div style={styles.card}>
          <label style={styles.label}>Handle</label>
          <input value={handle} onChange={e => setHandle(e.target.value.replace(/\s/g,'').slice(0,24))}
            placeholder="your_handle"
            style={styles.input} />
          <label style={{ ...styles.label, marginTop: 10 }}>Bio <span style={{ color: 'rgba(255,255,255,0.2)' }}>(max 120 chars)</span></label>
          <textarea value={bio} onChange={e => setBio(e.target.value.slice(0,120))}
            rows={2} placeholder="What's your signal?"
            style={{ ...styles.input, resize: 'none' }} />
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button onClick={saveEdits} style={styles.ctaBtn}>{saved ? '✓ Saved' : 'Save'}</button>
            <button onClick={() => setEditing(false)} style={styles.ghostBtn}>Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setEditing(true)} style={styles.editBtn}>✏️ Edit Profile</button>
      )}

      {/* ── STATS ROW ── */}
      <div style={styles.statsRow}>
        {[['Signals', myPosts.length], ['Rooms', 5], ['Role', role.charAt(0).toUpperCase() + role.slice(1)]].map(([label, val]) => (
          <div key={label} style={styles.statBox}>
            <div style={styles.statVal}>{val}</div>
            <div style={styles.statLabel}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── AETH BALANCE ── */}
      <div style={styles.aethCard}>
        <div style={styles.aethTop}>
          <span style={styles.aethLabel}>⚡ AETH Balance</span>
          {isFounder && <span style={styles.pioneerBadge}>2× Pioneer Active</span>}
        </div>
        <div style={styles.aethBal}>0</div>
        <div style={styles.aethSub}>Cap: 50,000 AETH · {isFounder ? 'Pioneer bonuses active' : 'Join before Jun 2026 for Pioneer status'}</div>
        <div style={{ marginTop: 14, height: 6, borderRadius: 6, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
          <div style={{ width: '0%', height: '100%', background: 'linear-gradient(90deg,#7c3aed,#a78bfa)', borderRadius: 6 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={styles.aethSub}>0 AETH</span>
          <span style={styles.aethSub}>50,000 cap</span>
        </div>
      </div>

      {/* ── SIGNAL KEY ── */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>🔑 Your Signal Key</div>
        <div style={styles.keyBox}>
          <span style={styles.keyText}>{'•'.repeat(24)}</span>
          <button onClick={copyKey} style={styles.copyBtn}>{copied ? '✓ Copied' : 'Copy'}</button>
        </div>
        <p style={styles.keyNote}>Never share your Signal Key. It is your identity and cannot be recovered.</p>
      </div>

      {/* ── FOUNDER STATEMENT (admin only) ── */}
      {isFounder && (
        <div style={styles.founderCard}>
          <div style={styles.founderHeader}>
            <div>
              <div style={styles.founderTitle}>★ Founder Statement</div>
              <div style={styles.founderSub}>From the builder of Conduit</div>
            </div>
            <button onClick={() => setShowStatement(s => !s)} style={styles.ghostBtn}>
              {showStatement ? 'Hide' : 'Read'}
            </button>
          </div>
          {showStatement && (
            <div style={styles.statementBox}>
              {FOUNDER_STATEMENT.split('\n').map((line, i) => (
                line ? <p key={i} style={styles.statementLine}>{line}</p>
                     : <div key={i} style={{ height: 10 }} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── LOGOUT ── */}
      <button onClick={onLogout} style={styles.logoutBtn}>🚪 Sign Out of Conduit</button>

    </div>
  )
}

const styles = {
  wrap: { padding: '20px 16px', maxWidth: 540, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14, color: '#e2e8f0', paddingBottom: 80 },
  heroCard: { background: 'linear-gradient(135deg,#0f0e1a,#16142a)', border: '1px solid #2d2a4a', borderRadius: 16, padding: '22px 20px', display: 'flex', alignItems: 'flex-start', gap: 16, boxShadow: '0 8px 32px rgba(124,58,237,0.12)' },
  avatarGlow: { position: 'relative', flexShrink: 0 },
  handle: { color: '#e2e8f0', fontSize: 20, fontWeight: 800, fontFamily: 'monospace' },
  noHandle: { color: 'rgba(255,255,255,0.2)', fontStyle: 'italic', fontSize: 14 },
  founderBadge: { fontSize: 10, padding: '3px 9px', borderRadius: 20, background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.35)', color: '#ffd700', fontFamily: 'monospace', fontWeight: 700 },
  modBadge: { fontSize: 10, padding: '3px 9px', borderRadius: 20, background: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.3)', color: '#ff8888', fontFamily: 'monospace', fontWeight: 700 },
  bio: { fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: '6px 0 0' },
  fpRow: { marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 },
  fp: { fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', letterSpacing: 1 },
  card: { background: '#0f0e1a', border: '1px solid #2d2a4a', borderRadius: 14, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 },
  cardTitle: { fontSize: 12, color: '#a78bfa', fontWeight: 700, fontFamily: 'monospace', letterSpacing: 1, marginBottom: 2 },
  label: { fontSize: 11, color: '#a78bfa', fontFamily: 'monospace' },
  input: { padding: '9px 12px', borderRadius: 8, background: '#1e1c30', border: '1px solid #3b3560', color: '#e2e8f0', fontSize: 13, outline: 'none', fontFamily: 'monospace', width: '100%', boxSizing: 'border-box' },
  editBtn: { alignSelf: 'flex-start', padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace' },
  ctaBtn: { flex: 1, padding: '9px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'monospace' },
  ghostBtn: { padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.35)', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace' },
  statsRow: { display: 'flex', gap: 10 },
  statBox: { flex: 1, background: '#0f0e1a', border: '1px solid #2d2a4a', borderRadius: 12, padding: '14px 10px', textAlign: 'center' },
  statVal: { fontFamily: 'monospace', fontSize: 18, fontWeight: 700, color: '#a78bfa' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 4 },
  aethCard: { background: 'linear-gradient(135deg,#0f0e1a,#1a1040)', border: '1px solid #3b3560', borderRadius: 14, padding: '18px 20px' },
  aethTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  aethLabel: { color: '#a78bfa', fontWeight: 700, fontSize: 13, fontFamily: 'monospace' },
  pioneerBadge: { fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa', fontFamily: 'monospace' },
  aethBal: { fontSize: 44, fontWeight: 900, color: '#7c3aed', lineHeight: 1, fontFamily: 'monospace' },
  aethSub: { fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 4, fontFamily: 'monospace' },
  keyBox: { background: '#1e1c30', border: '1px solid #3b3560', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  keyText: { fontFamily: 'monospace', fontSize: 16, color: '#7c3aed', letterSpacing: 2 },
  copyBtn: { padding: '5px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.4)', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace' },
  keyNote: { fontSize: 11, color: 'rgba(255,255,255,0.2)', lineHeight: 1.5, margin: 0 },
  founderCard: { background: 'linear-gradient(135deg,#1a1208,#0f0e1a)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 14, padding: '18px 20px' },
  founderHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' },
  founderTitle: { fontSize: 13, fontWeight: 700, color: '#ffd700', fontFamily: 'monospace', letterSpacing: 1 },
  founderSub: { fontSize: 10, color: 'rgba(255,215,0,0.4)', marginTop: 2, fontFamily: 'monospace' },
  statementBox: { marginTop: 14, padding: '14px 16px', background: 'rgba(255,215,0,0.03)', border: '1px solid rgba(255,215,0,0.1)', borderRadius: 10 },
  statementLine: { fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, margin: '0 0 0' },
  logoutBtn: { padding: '11px', borderRadius: 10, border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.05)', color: '#f87171', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'monospace', marginTop: 4, width: '100%' },
}
