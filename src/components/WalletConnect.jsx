import React from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

export default function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: '#a1a1aa', fontSize: 12, fontFamily: 'monospace' }}>
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          style={{
            padding: '4px 10px', borderRadius: 8, border: '1px solid #3f3f5a',
            background: 'transparent', color: '#71717a', fontSize: 11, cursor: 'pointer'
          }}
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: connectors[0] })}
      style={{
        padding: '6px 14px', borderRadius: 8, border: 'none',
        background: 'linear-gradient(135deg,#7a5cff,#00d4ff)',
        color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer'
      }}
    >
      Connect Wallet
    </button>
  );
}
