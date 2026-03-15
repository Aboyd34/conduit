import React, { useState } from 'react';
import { useAether } from '../hooks/useAether.js';

/**
 * AetherPanel — shown inside the You view and on post cards
 * Shows AETH balance, airdrop claim, and Recycle button per post
 */
export function AetherPanel() {
  const {
    isConnected, address, balance, isGated,
    hasClaimed, airdropOpen, contractReady, isPending,
    claimAirdrop,
  } = useAether();

  const [claiming, setClaiming] = useState(false);
  const [claimStatus, setClaimStatus] = useState('');

  // In production this comes from the airdrop-snapshot.json served at /api/airdrop/proof
  async function handleClaim() {
    setClaiming(true);
    setClaimStatus('');
    try {
      const res = await fetch(`/api/airdrop/proof?address=${address}`);
      if (!res.ok) throw new Error('No allocation found for this wallet');
      const { amountWei, proof } = await res.json();
      await claimAirdrop(amountWei, proof);
      setClaimStatus('✅ Claimed! AETH is on its way.');
    } catch (e) {
      setClaimStatus('❌ ' + (e.message || 'Claim failed'));
    } finally {
      setClaiming(false);
    }
  }

  if (!isConnected) {
    return (
      <div className="aether-panel aether-panel--disconnected">
        <span className="aether-icon">⚡</span>
        <p className="aether-msg">Connect wallet to use Aether</p>
      </div>
    );
  }

  if (!contractReady) {
    return (
      <div className="aether-panel aether-panel--pending">
        <span className="aether-icon">⚡</span>
        <p className="aether-msg">Aether launches soon — stay tuned</p>
      </div>
    );
  }

  return (
    <div className="aether-panel">
      <div className="aether-row">
        <span className="aether-icon">⚡</span>
        <div className="aether-balance-block">
          <span className="aether-balance">{parseFloat(balance).toLocaleString()} AETH</span>
          {isGated && <span className="aether-gated-badge">🔓 Gated access</span>}
        </div>
      </div>

      {airdropOpen && !hasClaimed && (
        <div className="aether-claim">
          <p className="aether-claim-label">🪂 You have an airdrop waiting</p>
          <button
            className="aether-claim-btn"
            onClick={handleClaim}
            disabled={claiming || isPending}
          >
            {claiming || isPending ? 'Claiming...' : 'Claim AETH'}
          </button>
          {claimStatus && <p className="aether-claim-status">{claimStatus}</p>}
        </div>
      )}

      {hasClaimed && (
        <p className="aether-claimed-badge">✅ Airdrop claimed</p>
      )}
    </div>
  );
}

/** Recycle button shown on individual post cards */
export function RecycleButton({ postId }) {
  const { isConnected, contractReady, isPending, recyclePost, balance } = useAether();
  const [status, setStatus] = useState('');
  const canAfford = parseFloat(balance) >= 10;

  async function handleRecycle() {
    setStatus('');
    try {
      await recyclePost(postId);
      setStatus('♻️ Recycled!');
      setTimeout(() => setStatus(''), 3000);
    } catch (e) {
      setStatus('❌ ' + (e.shortMessage || e.message || 'Failed'));
      setTimeout(() => setStatus(''), 3000);
    }
  }

  if (!isConnected || !contractReady) return null;

  return (
    <div className="recycle-wrap">
      <button
        className={`action-btn recycle-btn ${!canAfford ? 'action-btn--disabled' : ''}`}
        onClick={handleRecycle}
        disabled={isPending || !canAfford}
        title={canAfford ? 'Recycle this signal (burns 10 AETH)' : 'Need 10 AETH to recycle'}
      >
        <span className="action-icon">♻️</span>
        <span className="action-label">Recycle</span>
        <span className="action-count">10 AETH</span>
      </button>
      {status && <span className="recycle-status">{status}</span>}
    </div>
  );
}
