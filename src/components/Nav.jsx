import React from 'react';
import WalletConnect from './WalletConnect.jsx';

// Minimal, sharp SVG icons — no emoji, no cartoons
const Icons = {
  rooms: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  pulse: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  search: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  ai: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  airdrop: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="16"/>
      <line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  ),
  you: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  logo: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  ),
};

const NAV_ITEMS = [
  { id: 'rooms',   icon: Icons.rooms,   label: 'Rooms'    },
  { id: 'pulse',   icon: Icons.pulse,   label: 'Pulse'    },
  { id: 'search',  icon: Icons.search,  label: 'Search'   },
  { id: 'ai',      icon: Icons.ai,      label: 'Aether AI' },
  { id: 'airdrop', icon: Icons.airdrop, label: 'Airdrop'  },
  { id: 'you',     icon: Icons.you,     label: 'You'      },
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
      {/* Logo */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: '100%' }}>
        <div style={{
          color: '#7a5cff',
          marginBottom: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 36,
          height: 36,
          borderRadius: 10,
          background: 'rgba(122,92,255,0.12)',
        }}>
          {Icons.logo}
        </div>

        {/* Nav items */}
        {NAV_ITEMS.map(item => {
          const active = view === item.id;
          return (
            <button
              key={item.id}
              title={item.label}
              onClick={() => setView(item.id)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                border: 'none',
                background: active ? 'rgba(122,92,255,0.18)' : 'transparent',
                color: active ? '#7a5cff' : 'rgba(255,255,255,0.28)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.15s ease, color 0.15s ease, transform 0.15s ease',
                position: 'relative',
              }}
              onMouseEnter={e => {
                if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                e.currentTarget.style.background = active ? 'rgba(122,92,255,0.22)' : 'rgba(255,255,255,0.05)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = active ? '#7a5cff' : 'rgba(255,255,255,0.28)';
                e.currentTarget.style.background = active ? 'rgba(122,92,255,0.18)' : 'transparent';
              }}
            >
              {/* Active indicator bar */}
              {active && (
                <span className="nav-active-indicator" style={{
                  position: 'absolute',
                  left: -1,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 3,
                  height: 20,
                  borderRadius: '0 3px 3px 0',
                  background: '#7a5cff',
                }} />
              )}
              {item.icon}
            </button>
          );
        })}
      </div>

      {/* Wallet at bottom */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', paddingBottom: 4 }}>
        <WalletConnect compact />
      </div>
    </nav>
  );
}
