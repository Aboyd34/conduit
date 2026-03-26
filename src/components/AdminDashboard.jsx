import React, { useState } from 'react'
import { Avatar } from './UserProfile.jsx'

const BANNED_KEY = 'conduit_banned'
export function getBanned() { return JSON.parse(localStorage.getItem(BANNED_KEY) || '[]') }
export function banFingerprint(fp) {
  const list = getBanned()
  if (!list.includes(fp)) { list.push(fp); localStorage.setItem(BANNED_KEY, JSON.stringify(list)) }
}
export function unbanFingerprint(fp) {
  const list = getBanned().filter(f => f !== fp)
  localStorage.setItem(BANNED_KEY, JSON.stringify(list))
}

const MODS_KEY = 'conduit_mods'
export function getMods() { return JSON.parse(localStorage.getItem(MODS_KEY) || '[]') }
export function addMod(fp) {
  const list = getMods()
  if (!list.includes(fp)) { list.push(fp); localStorage.setItem(MODS_KEY, JSON.stringify(list)) }
}
export function removeMod(fp) {
  const list = getMods().filter(f => f !== fp)
  localStorage.setItem(MODS_KEY, JSON.stringify(list))
}

export default function AdminDashboard({ modLog = [], onClose, session }) {
  const [tab, setTab]       = useState('log')   // log | bans | mods
  const [banInput, setBan]  = useState('')
  const [modInput, setMod]  = useState('')
  const [banned, setBanned] = useState(getBanned)
  const [mods, setMods]     = useState(getMods)

  function handleBan() {
    const fp = banInput.trim()
    if (!fp) return
    banFingerprint(fp); setBanned(getBanned()); setBan('')
  }
  function handleUnban(fp) { unbanFingerprint(fp); setBanned(getBanned()) }
  function handleAddMod() {
    const fp = modInput.trim()
    if (!fp) return
    addMod(fp); setMods(getMods()); setMod('')
  }
  function handleRemoveMod(fp) { removeMod(fp); setMods(getMods()) }

  const TABS = ['log', 'bans', 'mods']
  const TAB_LABELS = { log: '📋 Mod Log', bans: '🚫 Bans', mods: '🛡️ Moderators' }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(7,6,15,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'linear-gradient(135deg,#0f0e1a,#1a0808)', border: '1px solid rgba(255,60,60,0.2)', borderRadius: 18, width: '100%', maxWidth: 640, maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(255,60,60,0.1)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '20px 24px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,60,60,0.1)', border: '1px solid rgba(255,60,60,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🔒</div>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: '#ff6666', letterSpacing: 1 }}>ADMIN DASHBOARD</div>
              <div style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.2)', marginTop: 1 }}>Conduit · Owner Panel</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>×</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, padding: '12px 24px 0', flexShrink: 0 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${tab === t ? 'rgba(255,60,60,0.35)' : 'rgba(255,255,255,0.07)'}`, background: tab === t ? 'rgba(255,60,60,0.1)' : 'transparent', color: tab === t ? '#ff8888' : 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'monospace' }}>
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px 24px' }}>

          {/* MOD LOG */}
          {tab === 'log' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: 2 }}>ALL ROOMS · {modLog.length} ACTIONS</span>
              </div>
              {modLog.length === 0 ? (
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', fontStyle: 'italic' }}>No mod actions yet.</p>
              ) : modLog.slice().reverse().map((entry, i) => (
                <div key={i} style={{ padding: '10px 14px', borderRadius: 8, background: entry.action === 'remove' ? 'rgba(255,60,60,0.06)' : 'rgba(255,200,0,0.04)', border: `1px solid ${entry.action === 'remove' ? 'rgba(255,60,60,0.15)' : 'rgba(255,200,0,0.12)'}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 14 }}>{entry.action === 'remove' ? '🗑️' : '⚠️'}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'monospace', fontSize: 10, color: entry.action === 'remove' ? '#ff6666' : '#ffcc00', fontWeight: 700 }}>{entry.action.toUpperCase()} · {entry.roomId?.toUpperCase()}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>post {entry.fp} — {entry.reason}</div>
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>{entry.time}</div>
                </div>
              ))}
            </div>
          )}

          {/* BANS */}
          {tab === 'bans' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={banInput} onChange={e => setBan(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleBan()}
                  placeholder="Fingerprint to ban (e.g. a3f9·bc12)"
                  style={{ flex: 1, padding: '9px 12px', borderRadius: 8, background: '#1e1c30', border: '1px solid #3b3560', color: '#e2e8f0', fontSize: 12, outline: 'none', fontFamily: 'monospace' }} />
                <button onClick={handleBan} style={{ padding: '9px 14px', borderRadius: 8, border: 'none', background: 'rgba(255,60,60,0.2)', color: '#ff6666', fontWeight: 700, fontSize: 11, cursor: 'pointer', fontFamily: 'monospace' }}>BAN</button>
              </div>
              {banned.length === 0 ? (
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', fontStyle: 'italic' }}>No banned users.</p>
              ) : banned.map(fp => (
                <div key={fp} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, background: 'rgba(255,60,60,0.05)', border: '1px solid rgba(255,60,60,0.15)' }}>
                  <Avatar fingerprint={fp} handle={fp} size={28} />
                  <span style={{ flex: 1, fontFamily: 'monospace', fontSize: 11, color: '#ff8888' }}>{fp}</span>
                  <button onClick={() => handleUnban(fp)} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.3)', fontSize: 10, cursor: 'pointer', fontFamily: 'monospace' }}>Unban</button>
                </div>
              ))}
            </div>
          )}

          {/* MODS */}
          {tab === 'mods' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: '0 0 4px', lineHeight: 1.5 }}>Assign fingerprints as moderators. They get warn/remove controls but cannot access this dashboard.</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={modInput} onChange={e => setMod(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddMod()}
                  placeholder="Fingerprint to promote"
                  style={{ flex: 1, padding: '9px 12px', borderRadius: 8, background: '#1e1c30', border: '1px solid #3b3560', color: '#e2e8f0', fontSize: 12, outline: 'none', fontFamily: 'monospace' }} />
                <button onClick={handleAddMod} style={{ padding: '9px 14px', borderRadius: 8, border: 'none', background: 'rgba(255,200,0,0.15)', color: '#ffcc00', fontWeight: 700, fontSize: 11, cursor: 'pointer', fontFamily: 'monospace' }}>+ MOD</button>
              </div>
              {mods.length === 0 ? (
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', fontStyle: 'italic' }}>No moderators assigned.</p>
              ) : mods.map(fp => (
                <div key={fp} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, background: 'rgba(255,200,0,0.04)', border: '1px solid rgba(255,200,0,0.15)' }}>
                  <Avatar fingerprint={fp} handle={fp} size={28} />
                  <span style={{ flex: 1, fontFamily: 'monospace', fontSize: 11, color: '#ffcc00' }}>{fp}</span>
                  <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 10, background: 'rgba(255,200,0,0.1)', border: '1px solid rgba(255,200,0,0.2)', color: '#ffcc00', fontFamily: 'monospace' }}>MOD</span>
                  <button onClick={() => handleRemoveMod(fp)} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.3)', fontSize: 10, cursor: 'pointer', fontFamily: 'monospace' }}>Remove</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
