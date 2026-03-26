import React, { useState, useEffect } from 'react'

// ─ Floating particle
function Particle({ x, delay, dur, size }) {
  return (
    <div style={{
      position: 'absolute',
      left: `${x}%`,
      bottom: '-10%',
      width: `${size}rem`,
      height: `${size}rem`,
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(124,58,237,0.6) 0%, transparent 70%)',
      animation: `floatUp ${dur}s ${delay}s infinite linear`,
      pointerEvents: 'none',
    }} />
  )
}

// ─ Earn row
function EarnRow({ icon, action, amount, highlight }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '11px 14px', borderRadius: 10,
      background: highlight ? 'rgba(255,215,0,0.06)' : 'rgba(255,255,255,0.03)',
      border: `1px solid ${highlight ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.06)'}`,
    }}>
      <div style={{ fontSize: 20, width: 32, textAlign: 'center', flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{action}</div>
      </div>
      <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 800, color: highlight ? '#ffd700' : '#a78bfa', whiteSpace: 'nowrap' }}>{amount}</div>
    </div>
  )
}

// ─ Stat tile
function StatTile({ value, label, color = '#7c3aed' }) {
  return (
    <div style={{
      flex: 1, textAlign: 'center', padding: '14px 8px',
      background: 'rgba(255,255,255,0.02)', borderRadius: 12,
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{ fontFamily: 'monospace', fontSize: 22, fontWeight: 900, color }}>{value}</div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 4, letterSpacing: 0.5 }}>{label}</div>
    </div>
  )
}

export function AirdropPage() {
  const [particles] = useState(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 5,
      dur: 4 + Math.random() * 5,
      size: 0.3 + Math.random() * 0.9,
    }))
  )

  const [phase, setPhase] = useState('idle') // idle | checking | eligible | claimed | ineligible
  const [allocation] = useState(Math.floor(Math.random() * 4000) + 500)

  function checkAllocation() {
    setPhase('checking')
    setTimeout(() => setPhase('eligible'), 2000)
  }
  function claimAeth() {
    setPhase('claiming')
    setTimeout(() => setPhase('claimed'), 2000)
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#07060f',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '0 16px 80px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Particle field */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {particles.map(p => <Particle key={p.id} {...p} />)}
      </div>

      {/* Ambient glow */}
      <div style={{ position: 'fixed', top: '15%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 300, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ width: '100%', maxWidth: 520, position: 'relative', zIndex: 1, paddingTop: 40 }}>

        {/* ── HERO ── */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          {/* Glowing bolt */}
          <div style={{
            width: 80, height: 80, borderRadius: 24, margin: '0 auto 20px',
            background: 'linear-gradient(135deg,rgba(124,58,237,0.3),rgba(255,215,0,0.15))',
            border: '1px solid rgba(255,215,0,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, boxShadow: '0 0 40px rgba(124,58,237,0.3)',
          }}>⚡</div>

          <h1 style={{ fontFamily: 'monospace', fontSize: 'clamp(24px,6vw,36px)', fontWeight: 900, color: '#fff', margin: '0 0 8px', letterSpacing: 2 }}>
            AETHER AIRDROP
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, margin: '0 0 6px' }}>
            You were here before the signal reached them.
          </p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', lineHeight: 1.5, margin: 0 }}>
            Early Conduit users earned AETH for every post, signal, and reply.
          </p>
        </div>

        {/* ── STATS ── */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          <StatTile value="500M" label="AETH AVAILABLE" color="#7c3aed" />
          <StatTile value="50K" label="MAX PER WALLET" color="#a78bfa" />
          <StatTile value="2×" label="PIONEER BONUS" color="#ffd700" />
        </div>

        {/* ── TIMELINE ── */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '18px 20px', marginBottom: 20 }}>
          <div style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: 2, marginBottom: 14 }}>AIRDROP TIMELINE</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { label: 'Activity Snapshot', date: 'Jun 2026', done: false, active: true },
              { label: 'Claim Window Opens', date: 'Jul 2026', done: false, active: false },
              { label: 'Token Goes Live', date: 'Q3 2026', done: false, active: false },
            ].map((step, i, arr) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', paddingBottom: i < arr.length - 1 ? 12 : 0, position: 'relative' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: step.active ? '#7c3aed' : 'rgba(255,255,255,0.1)', border: `2px solid ${step.active ? '#a78bfa' : 'rgba(255,255,255,0.15)'}`, boxShadow: step.active ? '0 0 8px rgba(124,58,237,0.6)' : 'none', marginTop: 2 }} />
                  {i < arr.length - 1 && <div style={{ width: 1, flex: 1, background: 'rgba(255,255,255,0.07)', marginTop: 4, minHeight: 20 }} />}
                </div>
                <div style={{ paddingBottom: 4 }}>
                  <div style={{ fontSize: 13, color: step.active ? '#e2e8f0' : 'rgba(255,255,255,0.4)', fontWeight: step.active ? 600 : 400 }}>{step.label}</div>
                  <div style={{ fontSize: 11, color: step.active ? '#a78bfa' : 'rgba(255,255,255,0.2)', fontFamily: 'monospace', marginTop: 2 }}>{step.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── HOW AETH IS EARNED ── */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '18px 20px', marginBottom: 20 }}>
          <div style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: 2, marginBottom: 12 }}>HOW AETH IS EARNED</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <EarnRow icon="📡" action="Post a signal in any room" amount="+50 AETH" />
            <EarnRow icon="⚡" action="Receive a signal boost" amount="+20 AETH" />
            <EarnRow icon="💬" action="Receive a reply in your thread" amount="+10 AETH" />
            <EarnRow icon="🌟" action="Pioneer — join before Jun 2026" amount="×2 everything" highlight />
          </div>
        </div>

        {/* ── PROGRESS BAR ── */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '18px 20px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: 2 }}>DISTRIBUTION PROGRESS</span>
            <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#a78bfa' }}>12.4% claimed</span>
          </div>
          <div style={{ height: 8, borderRadius: 8, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
            <div style={{ width: '12.4%', height: '100%', background: 'linear-gradient(90deg,#7c3aed,#a78bfa)', borderRadius: 8, transition: 'width 1s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>62M / 500M AETH distributed</span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>1,247 claimed</span>
          </div>
        </div>

        {/* ── CTA ZONE ── */}
        <div style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.1),rgba(255,215,0,0.04))', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 16, padding: '24px 22px', textAlign: 'center' }}>

          {phase === 'idle' && (
            <>
              <div style={{ fontSize: 28, marginBottom: 10 }}>🔍</div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, margin: '0 0 16px' }}>
                Connect your wallet to see your allocation based on your Conduit activity.
              </p>
              <button onClick={checkAllocation} style={styles.ctaBtn}>Check My Allocation</button>
            </>
          )}

          {phase === 'checking' && (
            <>
              <div style={styles.spinner} />
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 14, fontFamily: 'monospace' }}>Scanning activity snapshot…</p>
            </>
          )}

          {phase === 'eligible' && (
            <>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🌟</div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: '0 0 4px', fontFamily: 'monospace', letterSpacing: 1 }}>YOUR ALLOCATION</p>
              <div style={{ fontFamily: 'monospace', fontSize: 42, fontWeight: 900, color: '#a78bfa', lineHeight: 1, marginBottom: 4 }}>{allocation.toLocaleString()}</div>
              <div style={{ fontFamily: 'monospace', fontSize: 14, color: 'rgba(255,255,255,0.25)', marginBottom: 18 }}>AETH</div>
              <button onClick={claimAeth} style={styles.ctaBtn}>Claim AETH →</button>
            </>
          )}

          {phase === 'claiming' && (
            <>
              <div style={styles.spinner} />
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 14, fontFamily: 'monospace' }}>Submitting transaction…</p>
            </>
          )}

          {phase === 'claimed' && (
            <>
              <div style={{ fontSize: 48, marginBottom: 8, animation: 'pulse 1s ease' }}>⚡</div>
              <div style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 900, color: '#ffd700', marginBottom: 4, letterSpacing: 2 }}>CLAIMED</div>
              <div style={{ fontFamily: 'monospace', fontSize: 36, fontWeight: 900, color: '#a78bfa', lineHeight: 1 }}>{allocation.toLocaleString()} AETH</div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 10, lineHeight: 1.5 }}>🔓 #aether room unlocked. Head to Rooms to join the holders-only channel.</p>
            </>
          )}

        </div>

      </div>

      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0) scale(1);   opacity: 0; }
          10%  { opacity: 0.6; }
          90%  { opacity: 0.3; }
          100% { transform: translateY(-110vh) scale(0.4); opacity: 0; }
        }
        @keyframes pulse {
          0%,100% { transform: scale(1); }
          50%      { transform: scale(1.15); }
        }
      `}</style>
    </div>
  )
}

const styles = {
  ctaBtn: {
    padding: '13px 28px', borderRadius: 10, border: 'none',
    background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
    color: '#fff', fontWeight: 800, fontSize: 14,
    cursor: 'pointer', fontFamily: 'monospace', letterSpacing: 1,
    boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
    transition: 'transform 0.1s',
  },
  spinner: {
    width: 32, height: 32, border: '3px solid rgba(255,255,255,0.07)',
    borderTop: '3px solid #7c3aed', borderRadius: '50%',
    animation: 'spin 0.7s linear infinite', margin: '0 auto',
  },
}
