import React, { useState } from 'react'

const NAV_ITEMS = [
  { id: 'rooms',   label: 'Rooms',   icon: '📶', path: '/rooms' },
  { id: 'airdrop', label: 'Airdrop', icon: '⚡',    path: '/airdrop' },
  { id: 'pulse',   label: 'Pulse',   icon: '📡',   path: '/pulse' },
  { id: 'you',     label: 'You',     icon: '👤',   path: '/you' },
]

export default function Nav({ activePath = '/' }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const isActive = (path) => activePath === path || activePath.startsWith(path + '/')

  return (
    <>
      {/* ── DESKTOP sidebar ── */}
      <nav style={styles.desktop}>
        <div style={styles.logo}>
          <span style={styles.bolt}>⚡</span>
          <span style={styles.logoText}>CONDUIT</span>
        </div>
        <div style={styles.navList}>
          {NAV_ITEMS.map(item => (
            <a key={item.id} href={item.path} style={{
              ...styles.navItem,
              ...(isActive(item.path) ? styles.navItemActive : {}),
            }}>
              <span style={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </div>
      </nav>

      {/* ── MOBILE top bar ── */}
      <header style={styles.mobileBar}>
        <div style={styles.mobileLogo}>
          <span style={{ fontSize: 18 }}>⚡</span>
          <span style={styles.logoText}>CONDUIT</span>
        </div>
        <button onClick={() => setMenuOpen(o => !o)} style={styles.hamburger} aria-label="Menu">
          {menuOpen
            ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          }
        </button>
      </header>

      {/* ── MOBILE dropdown menu ── */}
      {menuOpen && (
        <div style={styles.mobileMenu} onClick={() => setMenuOpen(false)}>
          {NAV_ITEMS.map(item => (
            <a key={item.id} href={item.path} style={{
              ...styles.mobileNavItem,
              ...(isActive(item.path) ? styles.mobileNavItemActive : {}),
            }}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </div>
      )}

      {/* ── MOBILE bottom tab bar ── */}
      <nav style={styles.mobileBottom}>
        {NAV_ITEMS.map(item => (
          <a key={item.id} href={item.path} style={{
            ...styles.mobileTab,
            ...(isActive(item.path) ? styles.mobileTabActive : {}),
          }}>
            <span style={{ fontSize: 20, lineHeight: 1 }}>{item.icon}</span>
            <span style={{ fontSize: 9, marginTop: 2, fontFamily: 'monospace', letterSpacing: 0.5 }}>{item.label}</span>
          </a>
        ))}
      </nav>
    </>
  )
}

const styles = {
  /* DESKTOP */
  desktop: {
    display: 'none',
    '@media (min-width: 768px)': { display: 'flex' },
    position: 'fixed', left: 0, top: 0, bottom: 0, width: 220,
    background: '#0a0916', borderRight: '1px solid #1e1c30',
    flexDirection: 'column', padding: '28px 16px', zIndex: 100,
    gap: 4,
  },
  logo: { display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px 24px' },
  bolt: { fontSize: 22 },
  logoText: { fontFamily: 'monospace', fontWeight: 900, fontSize: 16, color: '#7c3aed', letterSpacing: 3 },
  navList: { display: 'flex', flexDirection: 'column', gap: 4 },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10,
    color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: 500,
    textDecoration: 'none', transition: 'all 0.15s', fontFamily: 'monospace',
  },
  navItemActive: { background: 'rgba(124,58,237,0.15)', color: '#a78bfa', borderLeft: '2px solid #7c3aed' },
  navIcon: { fontSize: 16, width: 22, textAlign: 'center' },

  /* MOBILE TOP BAR */
  mobileBar: {
    display: 'flex',
    position: 'fixed', top: 0, left: 0, right: 0, height: 52, zIndex: 200,
    background: 'rgba(10,9,22,0.96)', borderBottom: '1px solid #1e1c30',
    alignItems: 'center', justifyContent: 'space-between', padding: '0 16px',
    backdropFilter: 'blur(12px)',
  },
  mobileLogo: { display: 'flex', alignItems: 'center', gap: 8 },
  hamburger: {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, padding: '7px 8px', cursor: 'pointer', color: 'rgba(255,255,255,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },

  /* MOBILE DROPDOWN */
  mobileMenu: {
    position: 'fixed', top: 52, left: 0, right: 0, zIndex: 199,
    background: 'rgba(10,9,22,0.98)', borderBottom: '1px solid #1e1c30',
    display: 'flex', flexDirection: 'column', padding: '8px 12px 12px',
    backdropFilter: 'blur(16px)',
  },
  mobileNavItem: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
    borderRadius: 10, color: 'rgba(255,255,255,0.5)', fontSize: 15,
    textDecoration: 'none', fontFamily: 'monospace', transition: 'all 0.12s',
    fontWeight: 500,
  },
  mobileNavItemActive: { background: 'rgba(124,58,237,0.12)', color: '#a78bfa' },

  /* MOBILE BOTTOM TAB BAR */
  mobileBottom: {
    display: 'flex',
    position: 'fixed', bottom: 0, left: 0, right: 0, height: 60, zIndex: 200,
    background: 'rgba(10,9,22,0.97)', borderTop: '1px solid #1e1c30',
    alignItems: 'center', justifyContent: 'space-around',
    backdropFilter: 'blur(12px)',
  },
  mobileTab: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    flex: 1, height: '100%', textDecoration: 'none',
    color: 'rgba(255,255,255,0.3)', transition: 'all 0.15s',
  },
  mobileTabActive: { color: '#a78bfa' },
}
