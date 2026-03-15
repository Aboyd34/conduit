import React, { useEffect, useState } from "react";
import Feed from "./components/Feed.jsx";
import PostBox from "./components/PostBox.jsx";
import KeyManager from "./components/KeyManager.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import WalletConnect from "./components/WalletConnect.jsx";
import { PulseView } from "./components/PulseView.jsx";
import { RoomsView } from "./components/RoomsView.jsx";
import { YouView } from "./components/YouView.jsx";
import { ProfilePage } from "./components/ProfilePage.jsx";
import { Web3Provider } from "./providers/Web3Provider.jsx";
import { registerPeer } from "./api/gateway.js";
import { getPublicKey } from "./ConduitKeyManager.js";
import { AgeGate, isAgeVerified } from "./identity";
import "./index.css";

const NAV_ITEMS = [
  { id: 'home',  icon: '🏠', label: 'Home'  },
  { id: 'rooms', icon: '📡', label: 'Rooms' },
  { id: 'pulse', icon: '⚡',    label: 'Pulse' },
  { id: 'you',   icon: '👤', label: 'You'   },
];

export default function App() {
  const [peerRegistered, setPeerRegistered] = useState(false);
  const [activeNav, setActiveNav] = useState('home');
  const [viewingProfile, setViewingProfile] = useState(null);

  useEffect(() => {
    if (isAgeVerified()) {
      const pubKey = getPublicKey();
      if (pubKey && !peerRegistered) {
        registerPeer(pubKey)
          .then(() => setPeerRegistered(true))
          .catch(() => {});
      }
    }
  }, []);

  function renderView() {
    switch (activeNav) {
      case 'home':
        return (
          <>
            <ErrorBoundary><KeyManager /></ErrorBoundary>
            <ErrorBoundary><PostBox /></ErrorBoundary>
            <ErrorBoundary><Feed onViewProfile={setViewingProfile} /></ErrorBoundary>
          </>
        );
      case 'rooms':
        return (
          <ErrorBoundary>
            <RoomsView onViewProfile={setViewingProfile} />
          </ErrorBoundary>
        );
      case 'pulse':
        return (
          <ErrorBoundary>
            <PulseView />
          </ErrorBoundary>
        );
      case 'you':
        return (
          <ErrorBoundary>
            <YouView onViewProfile={setViewingProfile} />
          </ErrorBoundary>
        );
      default:
        return null;
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
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${activeNav === item.id ? 'nav-item--active' : ''}`}
                onClick={() => setActiveNav(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <main>
            {renderView()}
          </main>
        </div>

        {viewingProfile && (
          <ProfilePage
            pubkey={viewingProfile}
            onClose={() => setViewingProfile(null)}
          />
        )}
      </AgeGate>
    </Web3Provider>
  );
}
