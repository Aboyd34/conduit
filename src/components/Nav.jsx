import React from 'react';
import WalletConnect from './WalletConnect.jsx';

const Icons = {
  // Rooms — grid of signal nodes
  rooms: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  ),
  // Pulse — signal wave / activity line
  pulse: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12h3l3-8 4 16 3-10 2 4 2-2h3"/>
    </svg>
  ),
  // Search — magnifier with signal dot
  search: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="7"/>
      <line x1="17" y1="17" x2="22" y2="22"/>
    </svg>
  ),
  // Aether AI — brain/hex network
  ai: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
    </svg>
  ),
  // Airdrop — lightning bolt (AETH token feel)
  airdrop: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  ),
  // You — identity / fingerprint shield
  you: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  // Logo — conduit bolt
  logo: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  ),
};

const NAV_ITEMS = [
  { id: 'rooms',   icon: Icons.rooms,   label: 'Rooms'     },
  { id: 'pulse',   icon: Icons.pulse,   label: 'Pulse'     },
  { id: 'search',  icon: Icons.search,  label: 'Search'    },
  { id: 'ai',      icon: Icons.ai,      label: 'Aether AI' },
  { id: 'airdrop', icon: Icons.airdrop, label: 'Airdrop'   },
  { id: 'you',     icon: Icons.you,     label: 'You'       },
];

export default function Nav({ view, setView }) {
  return (
    <nav style={{
      width: 60,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      background: '#08071a',
      borderRight: '1px solid rgba(255,255,255,0.05)',
      padding: '14px 0 12px',
      gap: 2,
      flexShrink: 0,
      height: '100vh',
      justifyContent: 'space-between',
    }}>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: '100%' }}>
        {/* Logo */}
        <div style={{
          color: '#7a5cff',
          marginBottom: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 36, height: 36,
          borderRadius: 10,
          background: 'rgba(122,92,255,0.12)',
        }}>
          {Icons.logo}
        </div>

        {NAV_ITEMS.map(item => {
          const active = view === item.id;
          return (
            <button
              key={item.id}
              title={item.label}
              onClick={() => setView(item.id)}
              style={{
                width: 40, height: 40, borderRadius: 10, border: 'none',
                background: active ? 'rgba(122,92,255,0.18)' : 'transparent',
                color: active ? '#7a5cff' : 'rgba(255,255,255,0.28)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s, color 0.15s',
                position: 'relative',
              }}
              onMouseEnter={e => {
                if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.75)';
                e.currentTarget.style.background = active ? 'rgba(122,92,255,0.22)' : 'rgba(255,255,255,0.05)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = active ? '#7a5cff' : 'rgba(255,255,255,0.28)';
                e.currentTarget.style.background = active ? 'rgba(122,92,255,0.18)' : 'transparent';
              }}
            >
              {active && (
                <span style={{
                  position: 'absolute', left: -1, top: '50%',
                  transform: 'translateY(-50%)',
                  width: 3, height: 20,
                  borderRadius: '0 3px 3px 0',
                  background: '#7a5cff',
                }} />
              )}
              {item.icon}
            </button>
          );
        })}
      </div>

      {/* Wallet */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', paddingBottom: 4 }}>
        <WalletConnect compact />
      </div>
    </nav>
  );
}
