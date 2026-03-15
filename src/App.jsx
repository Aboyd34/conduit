import React, { useState, useEffect } from 'react';
import { WalletConnect } from './components/WalletConnect.jsx';
import RoomsView from './components/RoomsView.jsx';
import AirdropPage from './components/AirdropPage.jsx';
import PulseView from './components/PulseView.jsx';
import SearchView from './components/SearchView.jsx';
import NotificationsView from './components/NotificationsView.jsx';
import YouView from './components/YouView.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; }
  body {
    background: #07070d;
    color: #e8e8f0;
    font-family: 'Inter', system-ui, sans-serif;
    min-height: 100vh;
    line-height: 1.5;
  }

  /* ── Age Gate ── */
  .age-gate { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1rem; background: radial-gradient(ellipse at top, rgba(124,106,247,0.08), transparent 60%), #07070d; }
  .age-gate-card { background: #0f0f18; border: 1px solid #1c1c2e; border-radius: 20px; padding: 2.5rem 2rem; max-width: 480px; width: 100%; text-align: center; }
  .age-gate-card h1 { font-family: 'JetBrains Mono', monospace; font-size: 2rem; color: #7c5cff; margin-bottom: 0.25rem; letter-spacing: 0.08em; }
  .age-gate-tagline { color: #444455; font-size: 0.85rem; margin-bottom: 1.5rem; }
  .age-gate-notice { background: #07070d; border: 1px solid #1c1c2e; border-radius: 12px; padding: 1.25rem; text-align: left; margin-bottom: 1.5rem; }
  .age-gate-notice h2 { font-size: 1rem; margin-bottom: 0.75rem; color: #e8e8f0; }
  .age-gate-notice p { font-size: 0.85rem; color: #888899; margin-bottom: 0.75rem; line-height: 1.5; }
  .age-gate-notice ul { list-style: none; font-size: 0.82rem; color: #444455; display: flex; flex-direction: column; gap: 0.3rem; }
  .age-gate-status { font-size: 0.85rem; color: #7c5cff; margin-bottom: 1rem; }
  .age-gate-btn { width: 100%; padding: 0.85rem; font-size: 1rem; background: #7c5cff; color: #fff; border: none; border-radius: 12px; margin-bottom: 1rem; font-weight: 600; cursor: pointer; transition: background 0.15s; font-family: 'Inter', sans-serif; }
  .age-gate-btn:hover { background: #6a4ce0; }
  .age-gate-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .age-gate-legal { font-size: 0.72rem; color: #444455; line-height: 1.5; }

  /* ── App Shell ── */
  .app-header {
    position: fixed; top: 0; left: 0; right: 0; z-index: 60;
    height: 58px;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 1.25rem;
    background: rgba(7,7,13,0.92);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid #1c1c2e;
  }
  .app-header-brand { display: flex; align-items: center; gap: 0.75rem; }
  .app-header-logo {
    width: 36px; height: 36px; border-radius: 10px;
    background: rgba(124,106,247,0.12); border: 1px solid rgba(124,106,247,0.25);
    display: grid; place-items: center;
    font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700; color: #7c5cff;
  }
  .app-header-name { font-size: 1.05rem; font-weight: 700; color: #e8e8f0; letter-spacing: -0.3px; font-family: 'JetBrains Mono', monospace; }
  .app-header-right { display: flex; align-items: center; gap: 0.75rem; }
  .privacy-pill { display: flex; align-items: center; gap: 0.4rem; background: rgba(0,230,168,0.07); border: 1px solid rgba(0,230,168,0.18); border-radius: 999px; padding: 0.25rem 0.65rem; }
  .privacy-dot { width: 6px; height: 6px; border-radius: 50%; background: #00E6A8; box-shadow: 0 0 6px #00E6A8; animation: blink 2s infinite; }
  @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
  .privacy-label { font-size: 0.7rem; color: #00E6A8; }

  .app-body { display: grid; grid-template-columns: 220px 1fr; min-height: calc(100vh - 58px); padding-top: 58px; }

  /* ── Sidebar ── */
  .app-sidebar {
    position: fixed; top: 58px; left: 0;
    width: 220px; height: calc(100vh - 58px);
    background: linear-gradient(180deg, #0b0b16, #090914);
    border-right: 1px solid #1c1c2e;
    display: flex; flex-direction: column;
    overflow-y: auto; z-index: 50;
    transition: transform 0.25s cubic-bezier(0.4,0,0.2,1);
  }
  .sidebar-inner { display: flex; flex-direction: column; gap: 0.15rem; padding: 1rem 0.75rem; flex: 1; }
  .sidebar-section-label { font-size: 0.68rem; font-weight: 600; letter-spacing: 0.1em; color: #444455; text-transform: uppercase; padding: 0.75rem 0.9rem 0.3rem; }
  .nav-item {
    display: flex; align-items: center; gap: 0.75rem;
    padding: 0.65rem 0.9rem; border-radius: 10px;
    font-size: 0.88rem; color: #888899;
    cursor: pointer; transition: all 0.15s;
    border: 1px solid transparent; background: transparent;
    width: 100%; text-align: left;
  }
  .nav-item:hover { background: #161625; color: #e8e8f0; }
  .nav-item.active { background: rgba(124,106,247,0.12); border-color: rgba(124,106,247,0.4); color: #7c5cff; }
  .nav-icon { font-size: 1rem; width: 20px; text-align: center; flex-shrink: 0; }
  .nav-label { flex: 1; font-weight: 500; }
  .nav-badge { background: #ef4444; color: #fff; font-size: 0.65rem; font-weight: 700; padding: 0.1rem 0.35rem; border-radius: 999px; min-width: 18px; text-align: center; }
  .airdrop-dot { width: 7px; height: 7px; border-radius: 50%; background: #a78bfa; box-shadow: 0 0 6px #a78bfa; animation: blink 2s infinite; }
  .sidebar-footer { padding: 1rem 0.75rem; border-top: 1px solid #1c1c2e; display: flex; flex-direction: column; gap: 0.5rem; }
  .key-badge { display: flex; align-items: center; gap: 0.5rem; background: #111116; border: 1px solid #1e1e24; border-radius: 8px; padding: 8px 10px; }
  .key-dot { width: 6px; height: 6px; border-radius: 50%; background: #00E6A8; box-shadow: 0 0 6px #00E6A8; flex-shrink: 0; }
  .key-text { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #444455; }

  /* ── Stage ── */
  .app-stage { margin-left: 220px; min-width: 0; padding: 1.5rem; }

  /* ── Mobile ── */
  .mobile-menu-btn { display: none; flex-direction: column; justify-content: space-between; width: 28px; height: 20px; background: transparent; border: none; padding: 0; cursor: pointer; }
  .mobile-menu-btn span { display: block; height: 2px; border-radius: 2px; background: #888899; }
  .mobile-nav-overlay { position: fixed; inset: 0; z-index: 49; background: rgba(0,0,0,0.6); backdrop-filter: blur(2px); }

  @media (max-width: 900px) {
    .app-body { grid-template-columns: 1fr; }
    .app-sidebar { transform: translateX(-100%); width: 260px; box-shadow: 4px 0 30px rgba(0,0,0,0.6); }
    .app-sidebar.open { transform: translateX(0); }
    .app-stage { margin-left: 0; padding: 1rem; }
    .mobile-menu-btn { display: flex; }
    .privacy-pill { display: none; }
  }
`;

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
        <h1>CONDUIT<span style={{color:'#00E6A8'}}>.</span></h1>
        <p className="age-gate-tagline">Anonymous. Encrypted. Yours.</p>
        <div className="age-gate-notice">
          <h2>Before you enter</h2>
          <p>Conduit is an anonymous, decentralized communication platform. By entering you acknowledge:</p>
          <ul>
            <li>✦ You are 18 years of age or older</li>
            <li>✦ Content is user-generated and unmoderated</li>
            <li>✦ Your identity is local — no accounts, no servers</li>
            <li>✦ Messages are cryptographically signed by your device</li>
          </ul>
        </div>
        <p className="age-gate-status">🔐 Local key will be generated on entry</p>
        <label style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'0.5rem',fontSize:'0.85rem',color:'#888899',cursor:'pointer'}}>
          <input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)} />
          I am 18 or older
        </label>
        <label style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'1rem',fontSize:'0.85rem',color:'#888899',cursor:'pointer'}}>
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
  { id: 'rooms',    icon: '⚡', label: 'Rooms' },
  { id: 'pulse',    icon: '📡', label: 'Pulse' },
  { id: 'search',   icon: '🔍', label: 'Search' },
  { id: 'airdrop',  icon: '🪂', label: 'Airdrop', dot: true },
  { id: 'notifs',   icon: '🔔', label: 'Notifications', badge: 3 },
  { id: 'you',      icon: '👤', label: 'You' },
];

export default function App() {
  const [verified, setVerified] = useState(() => !!localStorage.getItem(AGE_GATE_KEY));
  const [view, setView] = useState('rooms');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!verified) return (
    <>
      <style>{STYLES}</style>
      <AgeGate onVerify={() => setVerified(true)} />
    </>
  );

  const pubkey = (() => { try { return JSON.parse(localStorage.getItem('conduit_identity') || '{}').pubkey || null; } catch { return null; } })();
  const shortKey = pubkey ? pubkey.slice(0,4).toUpperCase() + '..' + pubkey.slice(-4).toUpperCase() : '—';

  return (
    <>
      <style>{STYLES}</style>

      <header className="app-header">
        <div className="app-header-brand">
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(o => !o)}>
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
              <span className="key-text">{shortKey} · LOCAL KEY</span>
            </div>
          </div>
        </nav>

        <main className="app-stage">
          <ErrorBoundary>
            {view === 'rooms'  && <RoomsView />}
            {view === 'pulse'  && <PulseView />}
            {view === 'search' && <SearchView />}
            {view === 'airdrop'&& <AirdropPage />}
            {view === 'notifs' && <NotificationsView />}
            {view === 'you'    && <YouView />}
          </ErrorBoundary>
        </main>
      </div>
    </>
  );
}
