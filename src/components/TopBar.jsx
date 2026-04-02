import React, { useState } from 'react';
import './TopBar.css';

/* ─── Conduit logo glyph (inline SVG) ─── */
function ConduitGlyph({ size = 28 }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-label="Conduit"
      role="img"
    >
      {/* Outer ring */}
      <circle cx="16" cy="16" r="14" stroke="#7DF9FF" strokeWidth="1.5" strokeOpacity="0.4" />
      {/* Signal bars */}
      <rect x="9"  y="19" width="3" height="5" rx="1.5" fill="#7DF9FF" opacity="0.5" />
      <rect x="14" y="15" width="3" height="9" rx="1.5" fill="#7DF9FF" opacity="0.75" />
      <rect x="19" y="10" width="3" height="14" rx="1.5" fill="#7DF9FF" />
      {/* Top dot */}
      <circle cx="20.5" cy="8" r="1.5" fill="#7DF9FF" />
    </svg>
  );
}

export default function TopBar({
  title      = 'Conduit',
  mode       = 'user',      // 'user' | 'admin'
  identity   = null,        // { alias, pubkey, status }
  onIdentity = null,
  rightSlot  = null,
  onMenuToggle = null,
}) {
  const [showIdentity, setShowIdentity] = useState(false);
  const statusColor = {
    online:  'var(--success)',
    away:    'var(--warning)',
    offline: 'var(--text-muted)',
  }[identity?.status || 'online'];

  return (
    <header className={`topbar topbar--${mode}`} role="banner">

      {/* Left — logo + hamburger (mobile) */}
      <div className="topbar__left">
        {onMenuToggle && (
          <button className="topbar__menu-btn" onClick={onMenuToggle} aria-label="Toggle navigation">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <line x1="3" y1="6"  x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        )}
        <a className="topbar__logo" href="/" aria-label="Conduit home">
          <ConduitGlyph size={26} />
          <span className="topbar__wordmark">
            {mode === 'admin' ? (
              <><span style={{ color: 'var(--text-primary)' }}>Conduit</span>{' '}
              <span style={{ color: 'var(--danger)', fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 800, letterSpacing: '0.06em' }}>ADMIN</span></>
            ) : 'Conduit'}
          </span>
        </a>
      </div>

      {/* Center — context title */}
      <div className="topbar__center" aria-live="polite">
        <h1 className="topbar__title">{title}</h1>
      </div>

      {/* Right — identity + actions */}
      <div className="topbar__right">
        {rightSlot}

        {/* Status dot */}
        <span
          className="topbar__status-dot"
          style={{ background: statusColor }}
          aria-label={`Status: ${identity?.status || 'online'}`}
          title={identity?.status || 'online'}
        />

        {/* Identity chip */}
        <button
          className="topbar__identity"
          onClick={() => { setShowIdentity(v => !v); onIdentity && onIdentity(); }}
          aria-label={`Identity: ${identity?.alias || 'Anonymous'}`}
          aria-expanded={showIdentity}
        >
          <span className="topbar__identity-avatar">
            {identity?.alias?.[0]?.toUpperCase() || '?'}
          </span>
          <span className="topbar__identity-alias">
            {identity?.alias ? identity.alias.slice(0, 10) + (identity.alias.length > 10 ? '…' : '') : 'Anon'}
          </span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        {/* Identity dropdown */}
        {showIdentity && identity && (
          <div className="topbar__identity-dropdown" role="menu">
            <div className="topbar__identity-key mono">
              {identity.pubkey ? identity.pubkey.slice(0,8) + '…' + identity.pubkey.slice(-6) : 'No key'}
            </div>
            <hr className="divider" />
            <button className="topbar__dropdown-item" role="menuitem">Profile</button>
            <button className="topbar__dropdown-item" role="menuitem">Settings</button>
            <button className="topbar__dropdown-item topbar__dropdown-item--danger" role="menuitem">Sign out</button>
          </div>
        )}
      </div>
    </header>
  );
}
