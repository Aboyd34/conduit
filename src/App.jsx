import React, { useEffect, useState } from 'react';
import Feed from './components/Feed.jsx';
import PostBox from './components/PostBox.jsx';
import KeyManager from './components/KeyManager.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import WalletConnect from './components/WalletConnect.jsx';
import { PulseView } from './components/PulseView.jsx';
import { RoomsView } from './components/RoomsView.jsx';
import { YouView } from './components/YouView.jsx';
import { SearchView } from './components/SearchView.jsx';
import { NotificationsView } from './components/NotificationsView.jsx';
import { AirdropPage } from './components/AirdropPage.jsx';
import { ProfilePage } from './components/ProfilePage.jsx';
import {
  IconHome, IconRooms, IconPulse, IconSearch,
  IconAirdrop, IconAlerts, IconYou, IconConduit, IconWallet,
} from './components/ConduitIcons.jsx';
import { Web3Provider } from './providers/Web3Provider.jsx';
import { registerPeer } from './api/gateway.js';
import { getPublicKey } from './ConduitKeyManager.js';
import { AgeGate, isAgeVerified } from './identity';
import { useConduitSocket } from './hooks/useConduitSocket.js';
import { useNotifications } from './hooks/useNotifications.js';
import './index.css';

const NAV = [
  { id: 'home',          Icon: IconHome,     label: 'Home'    },
  { id: 'rooms',         Icon: IconRooms,    label: 'Rooms'   },
  { id: 'pulse',         Icon: IconPulse,    label: 'Pulse'   },
  { id: 'search',        Icon: IconSearch,   label: 'Search'  },
  { id: 'airdrop',       Icon: IconAirdrop,  label: 'Airdrop' },
  { id: 'notifications', Icon: IconAlerts,   label: 'Alerts'  },
  { id: 'you',           Icon: IconYou,      label: 'You'     },
];

export default function App() {
  const [peerRegistered, setPeerRegistered] = useState(false);
  const [activeNav, setActiveNav]           = useState('home');
  const [viewingProfile, setViewingProfile] = useState(null);
  const [mobileNavOpen, setMobileNavOpen]   = useState(false);

  const myPubkey = getPublicKey();
  const { notifications, unread, addNotification, markAllRead, clearAll } = useNotifications(myPubkey);
  const { allPosts } = useConduitSocket(addNotification);

  useEffect(() => {
    if (isAgeVerified()) {
      const pubKey = getPublicKey();
      if (pubKey && !peerRegistered)
        registerPeer(pubKey).then(() => setPeerRegistered(true)).catch(() => {});
    }
  }, []);

  function handleNav(id) {
    setActiveNav(id);
    setMobileNavOpen(false);
    if (id === 'notifications') markAllRead();
  }

  function renderView() {
    switch (activeNav) {
      case 'home':
        return (
          <>
            <ErrorBoundary><KeyManager /></ErrorBoundary>
            <ErrorBoundary><PostBox /></ErrorBoundary>
            <ErrorBoundary>
              <Feed
                onViewProfile={setViewingProfile}
                onNotification={addNotification}
              />
            </ErrorBoundary>
          </>
        );
      case 'rooms':         return <ErrorBoundary><RoomsView onViewProfile={setViewingProfile} /></ErrorBoundary>;
      case 'pulse':         return <ErrorBoundary><PulseView /></ErrorBoundary>;
      case 'search':        return <ErrorBoundary><SearchView allPosts={allPosts} onViewProfile={setViewingProfile} /></ErrorBoundary>;
      case 'airdrop':       return <ErrorBoundary><AirdropPage /></ErrorBoundary>;
      case 'notifications': return <ErrorBoundary><NotificationsView notifications={notifications} onClear={clearAll} onMarkRead={markAllRead} /></ErrorBoundary>;
      case 'you':           return <ErrorBoundary><YouView onViewProfile={setViewingProfile} /></ErrorBoundary>;
      default: return null;
    }
  }

  return (
    <Web3Provider>
      <AgeGate minAge={18}>

        {/* ── Global Header ── */}
        <header className="app-header">
          <div className="app-header-brand">
            <div className="app-header-logo">
              <IconConduit size={22} color="var(--accent)" />
            </div>
            <div>
              <span className="app-header-name">Conduit</span>
              <span className="app-header-tag">Communication without witnesses.</span>
            </div>
          </div>

          <div className="app-header-right">
            <div className="app-header-privacy">
              <span className="privacy-dot" />
              <span className="privacy-label">No data stored</span>
            </div>
            <ErrorBoundary>
              <WalletConnect />
            </ErrorBoundary>
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileNavOpen(v => !v)}
              aria-label="Toggle navigation"
            >
              <span /><span /><span />
            </button>
          </div>
        </header>

        {/* ── App Body ── */}
        <div className="app-body">

          {/* ── Sidebar / Mobile Drawer ── */}
          {mobileNavOpen && (
            <div className="mobile-nav-overlay" onClick={() => setMobileNavOpen(false)} />
          )}
          <nav className={`app-sidebar ${mobileNavOpen ? 'app-sidebar--open' : ''}`}>
            <div className="app-sidebar-inner">
              {NAV.map(({ id, Icon, label }) => (
                <button
                  key={id}
                  className={[
                    'nav-item',
                    activeNav === id   ? 'nav-item--active'  : '',
                    id === 'airdrop'   ? 'nav-item--airdrop' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => handleNav(id)}
                >
                  <span className="nav-icon">
                    <Icon size={18} color="currentColor" />
                  </span>
                  <span className="nav-label">{label}</span>

                  {id === 'notifications' && unread > 0 && (
                    <span className="nav-badge">{unread > 9 ? '9+' : unread}</span>
                  )}
                  {id === 'airdrop' && (
                    <span className="nav-airdrop-dot" />
                  )}
                </button>
              ))}
            </div>

            {/* Sidebar footer — privacy indicators */}
            <div className="sidebar-footer">
              <div className="sidebar-privacy-row">
                <span className="sidebar-privacy-dot" />
                <span className="sidebar-privacy-text">🔒 Local identity</span>
              </div>
              <div className="sidebar-privacy-row">
                <span className="sidebar-privacy-dot" />
                <span className="sidebar-privacy-text">🛰 Relay only</span>
              </div>
              <div className="sidebar-privacy-row">
                <span className="sidebar-privacy-dot" />
                <span className="sidebar-privacy-text">🔑 Keys stored locally</span>
              </div>
            </div>
          </nav>

          {/* ── Main Stage ── */}
          <main className="app-stage">
            <div className="app-stage-inner">
              {renderView()}
            </div>
          </main>
        </div>

        {/* ── Profile Overlay ── */}
        {viewingProfile && (
          <ProfilePage pubkey={viewingProfile} onClose={() => setViewingProfile(null)} />
        )}

      </AgeGate>
    </Web3Provider>
  );
}
