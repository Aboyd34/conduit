import React, { useState, useEffect } from 'react';
import { useAether } from '../hooks/useAether.js';

/**
 * AirdropPage — cinematic full-screen airdrop experience
 * Shown as its own nav view so the moment feels earned
 */
export function AirdropPage() {
  const {
    isConnected, address, balance, isGated,
    hasClaimed, airdropOpen, contractReady, isPending,
    claimAirdrop,
  } = useAether();

  const [phase, setPhase]       = useState('idle'); // idle | checking | eligible | ineligible | claiming | success | error
  const [allocation, setAlloc]  = useState(null);   // { amountWei, amountAETH, proof }
  const [errorMsg, setErrorMsg] = useState('');
  const [particles, setParticles] = useState([]);

  // Generate floating particle positions once
  useEffect(() => {
    setParticles(Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 4,
      dur: 3 + Math.random() * 4,
      size: 0.4 + Math.random() * 0.8,
    })));
  }, []);

  async function checkEligibility() {
    if (!isConnected || !address) return;
    setPhase('checking');
    try {
      const res = await fetch(`/api/airdrop/proof?address=${address}`);
      if (!res.ok) { setPhase('ineligible'); return; }
      const data = await res.json();
      setAlloc(data);
      setPhase(hasClaimed ? 'success' : 'eligible');
    } catch {
      setPhase('ineligible');
    }
  }

  async function handleClaim() {
    if (!allocation) return;
    setPhase('claiming');
    try {
      await claimAirdrop(allocation.amountWei, allocation.proof);
      setPhase('success');
    } catch (e) {
      setErrorMsg(e.shortMessage || e.message || 'Transaction failed');
      setPhase('error');
    }
  }

  return (
    <div className="airdrop-page">
      {/* Ambient particles */}
      <div className="airdrop-particles" aria-hidden>
        {particles.map(p => (
          <div
            key={p.id}
            className="airdrop-particle"
            style={{
              left: `${p.x}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.dur}s`,
              width: `${p.size}rem`,
              height: `${p.size}rem`,
            }}
          />
        ))}
      </div>

      <div className="airdrop-card">
        {/* Header */}
        <div className="airdrop-hero">
          <div className="airdrop-logo">⚡</div>
          <h1 className="airdrop-title">Aether Airdrop</h1>
          <p className="airdrop-subtitle">You were here before the signal reached them.</p>
          <p className="airdrop-subtitle airdrop-subtitle--dim">Early Conduit users earned AETH for every post, signal, and reply.</p>
        </div>

        {/* Stats bar */}
        <div className="airdrop-stats">
          <div className="airdrop-stat">
            <span className="airdrop-stat-value">500M</span>
            <span className="airdrop-stat-label">AETH Available</span>
          </div>
          <div className="airdrop-stat-divider" />
          <div className="airdrop-stat">
            <span className="airdrop-stat-value">50K</span>
            <span className="airdrop-stat-label">Max Per Wallet</span>
          </div>
          <div className="airdrop-stat-divider" />
          <div className="airdrop-stat">
            <span className="airdrop-stat-value">2×</span>
            <span className="airdrop-stat-label">Pioneer Bonus</span>
          </div>
        </div>

        {/* Earn guide */}
        <div className="airdrop-earn">
          <p className="airdrop-earn-title">How AETH was earned</p>
          <div className="airdrop-earn-grid">
            <div className="airdrop-earn-item">
              <span className="airdrop-earn-icon">📶</span>
              <span className="airdrop-earn-action">Posted a signal</span>
              <span className="airdrop-earn-amount">+50 AETH</span>
            </div>
            <div className="airdrop-earn-item">
              <span className="airdrop-earn-icon">⚡</span>
              <span className="airdrop-earn-action">Received a signal boost</span>
              <span className="airdrop-earn-amount">+20 AETH</span>
            </div>
            <div className="airdrop-earn-item">
              <span className="airdrop-earn-icon">💬</span>
              <span className="airdrop-earn-action">Received a reply</span>
              <span className="airdrop-earn-amount">+10 AETH</span>
            </div>
            <div className="airdrop-earn-item airdrop-earn-item--pioneer">
              <span className="airdrop-earn-icon">🌟</span>
              <span className="airdrop-earn-action">Pioneer (early join)</span>
              <span className="airdrop-earn-amount">×2 everything</span>
            </div>
          </div>
        </div>

        {/* CTA states */}
        <div className="airdrop-cta">

          {!contractReady && (
            <div className="airdrop-soon">
              <p className="airdrop-soon-label">🔔 Contract launching soon</p>
              <p className="airdrop-soon-sub">Keep posting. Your activity is being tracked.
Every signal you send right now earns you more AETH when we go live.</p>
            </div>
          )}

          {contractReady && !isConnected && (
            <div className="airdrop-connect-prompt">
              <p className="airdrop-connect-text">Connect your wallet to check your allocation.</p>
              <p className="airdrop-connect-sub">Your Conduit activity is linked to your wallet via the connection you made in the app.</p>
            </div>
          )}

          {contractReady && isConnected && phase === 'idle' && !hasClaimed && airdropOpen && (
            <button className="airdrop-check-btn" onClick={checkEligibility}>
              Check My Allocation
            </button>
          )}

          {contractReady && isConnected && hasClaimed && phase !== 'success' && (
            <div className="airdrop-claimed">
              <p className="airdrop-claimed-icon">✅</p>
              <p className="airdrop-claimed-title">You claimed your AETH</p>
              <p className="airdrop-claimed-balance">{parseFloat(balance).toLocaleString()} AETH in wallet</p>
              {isGated && <p className="airdrop-gated-note">🔓 You have #aether room access</p>}
            </div>
          )}

          {phase === 'checking' && (
            <div className="airdrop-checking">
              <div className="airdrop-spinner" />
              <p>Checking your allocation…</p>
            </div>
          )}

          {phase === 'eligible' && allocation && (
            <div className="airdrop-eligible">
              <div className="airdrop-eligible-glow" />
              <p className="airdrop-eligible-label">Your allocation</p>
              <p className="airdrop-eligible-amount">{parseInt(allocation.amountAETH).toLocaleString()} AETH</p>
              <p className="airdrop-eligible-sub">Ready to claim to your wallet</p>
              <button className="airdrop-claim-btn" onClick={handleClaim} disabled={isPending}>
                {isPending ? 'Confirm in wallet…' : 'Claim AETH →'}
              </button>
            </div>
          )}

          {phase === 'claiming' && (
            <div className="airdrop-checking">
              <div className="airdrop-spinner" />
              <p>Transaction submitted… confirm in your wallet.</p>
            </div>
          )}

          {phase === 'success' && (
            <div className="airdrop-success">
              <div className="airdrop-success-burst">⚡</div>
              <p className="airdrop-success-title">AETH Claimed</p>
              <p className="airdrop-success-bal">{parseFloat(balance).toLocaleString()} AETH</p>
              {isGated && (
                <div className="airdrop-success-gate">
                  <p>🔓 #aether room unlocked</p>
                  <p className="airdrop-success-gate-sub">Head to Rooms to join the holders-only channel.</p>
                </div>
              )}
            </div>
          )}

          {phase === 'ineligible' && (
            <div className="airdrop-ineligible">
              <p className="airdrop-ineligible-icon">📡</p>
              <p className="airdrop-ineligible-title">Not in this snapshot</p>
              <p className="airdrop-ineligible-sub">Keep posting and signaling. Future airdrops will include you.</p>
            </div>
          )}

          {phase === 'error' && (
            <div className="airdrop-ineligible">
              <p className="airdrop-ineligible-icon">❌</p>
              <p className="airdrop-ineligible-title">{errorMsg}</p>
              <button className="airdrop-check-btn" style={{ marginTop:'1rem' }} onClick={() => setPhase('eligible')}>
                Try Again
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
