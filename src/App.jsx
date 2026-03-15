import React, { useEffect, useState } from "react";
import Feed from "./components/Feed.jsx";
import PostBox from "./components/PostBox.jsx";
import KeyManager from "./components/KeyManager.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import WalletConnect from "./components/WalletConnect.jsx";
import { PulseView } from "./components/PulseView.jsx";
import { RoomsView } from "./components/RoomsView.jsx";
import { YouView } from "./components/YouView.jsx";
import { SearchView } from "./components/SearchView.jsx";
import { NotificationsView } from "./components/NotificationsView.jsx";
import { AirdropPage } from "./components/AirdropPage.jsx";
import { ProfilePage } from "./components/ProfilePage.jsx";
import { Web3Provider } from "./providers/Web3Provider.jsx";
import { registerPeer } from "./api/gateway.js";
import { getPublicKey } from "./ConduitKeyManager.js";
import { AgeGate, isAgeVerified } from "./identity";
import { useConduitSocket } from "./hooks/useConduitSocket.js";
import { useNotifications } from "./hooks/useNotifications.js";
import "./index.css";

const NAV_ITEMS = [
  { id: 'home',          icon: '🏠', label: 'Home'    },
  { id: 'rooms',         icon: '📡', label: 'Rooms'   },
  { id: 'pulse',         icon: '⚡',    label: 'Pulse'   },
  { id: 'search',        icon: '🔍', label: 'Search'  },
  { id: 'airdrop',       icon: '🪂', label: 'Airdrop' },
  { id: 'notifications', icon: '🔔', label: 'Alerts'  },
  { id: 'you',           icon: '👤', label: 'You'     },
];

export default function App() {
  const [peerRegistered, setPeerRegistered] = useState(false);
  const [activeNav, setActiveNav]           = useState('home');
  const [activeRoom, setActiveRoom]         = useState('public');
  const [viewingProfile, setViewingProfile] = useState(null);

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

  function handleNavClick(id) {
    setActiveNav(id);
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
                activeRoom={activeRoom}
                onRoomChange={setActiveRoom}
                onNotification={addNotification}
              />
            </ErrorBoundary>
          </>
        );
      case 'rooms':   return <ErrorBoundary><RoomsView onViewProfile={setViewingProfile} /></ErrorBoundary>;
      case 'pulse':   return <ErrorBoundary><PulseView /></ErrorBoundary>;
      case 'search':  return <ErrorBoundary><SearchView allPosts={allPosts} onViewProfile={setViewingProfile} /></ErrorBoundary>;
      case 'airdrop': return <ErrorBoundary><AirdropPage /></ErrorBoundary>;
      case 'notifications':
        return (
          <ErrorBoundary>
            <NotificationsView notifications={notifications} onClear={clearAll} onMarkRead={markAllRead} />
          </ErrorBoundary>
        );
      case 'you': return <ErrorBoundary><YouView onViewProfile={setViewingProfile} /></ErrorBoundary>;
      default: return null;
    }
  }

  return (
    <Web3Provider>
      <AgeGate minAge={18}>
        <header>
          <h1>⚡ Conduit</h1>
          <p className="tagline">Communication without witnesses.</p>
          <div className="header-right">
            <ErrorBoundary><WalletConnect /></ErrorBoundary>
          </div>
        </header>

        <div className="app">
          <nav className="sidebar">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                className={`nav-item ${activeNav === item.id ? 'nav-item--active' : ''} ${item.id === 'airdrop' ? 'nav-item--airdrop' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {item.id === 'notifications' && unread > 0 && (
                  <span className="nav-badge">{unread > 9 ? '9+' : unread}</span>
                )}
                {item.id === 'airdrop' && (
                  <span className="nav-airdrop-dot" />
                )}
              </button>
            ))}
          </nav>
          <main>{renderView()}</main>
        </div>

        {viewingProfile && (
          <ProfilePage pubkey={viewingProfile} onClose={() => setViewingProfile(null)} />
        )}
      </AgeGate>
    </Web3Provider>
  );
}
