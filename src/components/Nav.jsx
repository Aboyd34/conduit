import React from 'react';
import WalletConnect from './WalletConnect.jsx';

const NAV_ITEMS = [
  { id: 'rooms',   icon: '⚡', label: 'Rooms'    },
  { id: 'pulse',   icon: '📡', label: 'Pulse'    },
  { id: 'search',  icon: '🔍', label: 'Search'   },
  { id: 'ai',      icon: '🤖', label: 'Aether AI' },
  { id: 'airdrop', icon: '🪂', label: 'Airdrop'  },
  { id: 'you',     icon: '👤', label: 'You'       },
];

export default function Nav({ view, setView }) {
  return (
    <nav style={{
      width: 64, display: 'flex', flexDirection: 'column', alignItems: 'center',
      background: '#0c0b18', borderRight: '1px solid #1a1a2e',
      padding: '16px 0', gap: 4, flexShrink: 0, height: '100vh',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        {/* Logo */}
        <div style={{ color: '#7a5cff', fontSize: 22, fontWeight: 900, marginBottom: 12 }}>⚡</div>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            title={item.label}
            onClick={() => setView(item.id)}
            style={{
              width: 44, height: 44, borderRadius: 12, border: 'none',
              background: view === item.id ? 'rgba(122,92,255,0.2)' : 'transparent',
              color: view === item.id ? '#7a5cff' : '#52527a',
              fontSize: 20, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s'
            }}
          >
            {item.icon}
          </button>
        ))}
      </div>
      <div style={{ padding: '0 8px', width: '100%', display: 'flex', justifyContent: 'center' }}>
        <WalletConnect />
      </div>
    </nav>
  );
}
