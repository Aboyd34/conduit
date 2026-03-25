import React from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

const WalletIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 12V22H4V12"/>
    <path d="M22 7H2v5h20V7z"/>
    <path d="M12 22V7"/>
    <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/>
    <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/>
  </svg>
);

export default function WalletConnect({ compact = false }) {
  const { address, isConnected } = useAccount();
  const { connect, connectors }  = useConnect();
  const { disconnect }           = useDisconnect();

  if (isConnected) {
    return (
      <button
        onClick={() => disconnect()}
        title={address}
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          border: '1px solid rgba(0,212,255,0.25)',
          background: 'rgba(0,212,255,0.08)',
          color: '#00d4ff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2,
          transition: 'all 0.15s',
          padding: 0,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,212,255,0.14)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,212,255,0.08)'; }}
      >
        <WalletIcon />
        <span style={{ fontSize: 8, fontFamily: 'monospace', color: '#00d4ff', letterSpacing: 0 }}>
          {address?.slice(0, 4)}…{address?.slice(-3)}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: connectors[0] })}
      title="Connect Wallet"
      style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        border: '1px solid rgba(122,92,255,0.3)',
        background: 'rgba(122,92,255,0.1)',
        color: 'rgba(255,255,255,0.45)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(122,92,255,0.2)';
        e.currentTarget.style.color = '#7a5cff';
        e.currentTarget.style.borderColor = 'rgba(122,92,255,0.6)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(122,92,255,0.1)';
        e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
        e.currentTarget.style.borderColor = 'rgba(122,92,255,0.3)';
      }}
    >
      <WalletIcon />
    </button>
  );
}
