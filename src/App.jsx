import React, { useState } from 'react';
import { WalletConnect } from './components/WalletConnect.jsx';
import { RoomsView } from './components/RoomsView.jsx';
import { AirdropPage } from './components/AirdropPage.jsx';
import { PulseView } from './components/PulseView.jsx';
import { SearchView } from './components/SearchView.jsx';
import { NotificationsView } from './components/NotificationsView.jsx';
import { YouView } from './components/YouView.jsx';
import { AgentsPanel } from './components/AgentsPanel.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import './components/AgentsPanel.css';

const AGE_GATE_KEY = 'conduit_age_verified';

function AgeGate({ onVerify }) {
  const [checked, setChecked] = useState(false);
  const [agreed, setAgreed] = useState(false);

  function handleVerify() {
    if (!checked || !agreed) return;
    localStorage.setItem(AGE_GATE_KEY, '1');
    onVerify();
  }

  return (
    <div className="age-gate">
      <div className="age-gate-card">
        <h1>CONDUIT<span style={{color:'var(--accent3)'}}>.</span></h1>
        <p className="age-gate-tagline">Anonymous. Encrypted. Yours.</p>
        <div className="age-gate-notice">
          <h2>Before you enter</h2>
          <p>Conduit is an anonymous, decentralized communication platform. By entering you acknowledge:</p>
          <ul>
            <li>&#9734; You are 18 years of age or older</li>
            <li>&#9734; Content is user-generated and unmoderated</li>
            <li>&#9734; Your identity is local &#8212; no accounts, no servers</li>
            <li>&#9734; Messages are cryptographically signed by your device</li>
          </ul>
        </div>
        <p className="age-gate-status">&#128274; Local key will be generated on entry</p>
        <label style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'0.5rem',fontSize:'0.85rem',color:'var(--text-muted)',cursor:'pointer'}}>
          <input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)} />
          I am 18 or older
        </label>
        <label style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'1rem',fontSize:'0.85rem',color:'var(--text-muted)',cursor:'pointer'}}>
          <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
          I agree to the terms of use
        </label>
        <button className="age-gate-btn" disabled={!checked || !agreed} onClick={handleVerify}>
          Enter Conduit
        </button>
        <p className="age-gate-legal">By entering, you confirm you meet the age requirement. Conduit stores no personal data. Your key is generated locally and never transmitted.</p>
      </div>
    </div>
  );
}

const NAV = [
  { id: 'rooms',   icon: '\u26a1',       label: 'Rooms' },
  { id: 'pulse',   icon: '\ud83d\udce1', label: 'Pulse' },
  { id: 'search',  icon: '\ud83d\udd0d', label: 'Search' },
  { id: 'airdrop', icon: '\ud83e\ude82', label: 'Airdrop', dot: true },
  { id: 'notifs',  icon: '\ud83d\udd14', label: 'Notifications', badge: 3 },
  { id: 'agents',  icon: '\ud83e\udde0', label: 'Agents' },
  { id: 'you',     icon: '\ud83d\udc64', label: 'You' },
];

export default function App() {
  const [verified, setVerified] = useState(() => !!localStorage.getItem(AGE_GATE_KEY));
  const [view, setView] = useState('rooms');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!verified) return <AgeGate onVerify={() => setVerified(true)} />;

  const shortKey = (() => {
    try {
      const id = JSON.parse(localStorage.getItem('conduit_identity') || '{}');
      const k = id.pubkey || '';
      return k ? k.slice(0,4).toUpperCase() + '..' + k.slice(-4).toUpperCase() : 'NO KEY';
    } catch { return 'NO KEY'; }
  })();

  return (
    <>
      <header className="app-header">
        <div className="app-header-brand">
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(o => !o)} aria-label="Menu">
            <span /><span /><span />
          </button>
          <div className="app-header-logo">C</div>
          <span className="app-header-name">CONDUIT</span>
        </div>
        <div className="app-header-right">
          <div className="privacy-pill">
            <div className="privacy-dot" />
            <span className="privacy-label">No tracking</span>
          </div>
          <ErrorBoundary>
            <WalletConnect />
          </ErrorBoundary>
        </div>
      </header>

      {sidebarOpen && <div className="mobile-nav-overlay" onClick={() => setSidebarOpen(false)} />}

      <div className="app-body">
        <nav className={`app-sidebar${sidebarOpen ? ' open' : ''}`}>
          <div className="sidebar-inner">
            <div className="sidebar-section-label">Navigate</div>
            {NAV.map(item => (
              <button
                key={item.id}
                className={`nav-item${view === item.id ? ' active' : ''}`}
                onClick={() => { setView(item.id); setSidebarOpen(false); }}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
                {item.dot && <span className="airdrop-dot" />}
              </button>
            ))}
          </div>
          <div className="sidebar-footer">
            <div className="key-badge">
              <div className="key-dot" />
              <span className="key-text">{shortKey} &middot; LOCAL KEY</span>
            </div>
          </div>
        </nav>

        <main className="app-stage">
          <ErrorBoundary>
            {view === 'rooms'   && <RoomsView />}
            {view === 'pulse'   && <PulseView />}
            {view === 'search'  && <SearchView />}
            {view === 'airdrop' && <AirdropPage />}
            {view === 'notifs'  && <NotificationsView />}
            {view === 'agents'  && <AgentsPanel />}
            {view === 'you'     && <YouView />}
          </ErrorBoundary>
        </main>
      </div>
    </>
  );
}
