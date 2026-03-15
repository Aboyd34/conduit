import React, { useEffect, useState } from "react";
import Feed from "./components/Feed.jsx";
import PostBox from "./components/PostBox.jsx";
import KeyManager from "./components/KeyManager.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import WalletConnect from "./components/WalletConnect.jsx";
import { Web3Provider } from "./providers/Web3Provider.jsx";
import { registerPeer } from "./api/gateway.js";
import { getPublicKey } from "./ConduitKeyManager.js";
import { AgeGate, isAgeVerified } from "./identity";
import "./index.css";

const NAV_ITEMS = [
  { icon: '🏠', label: 'Home' },
  { icon: '📡', label: 'Rooms' },
  { icon: '⚡', label: 'Pulse' },
  { icon: '👤', label: 'You' },
];

export default function App() {
  const [peerRegistered, setPeerRegistered] = useState(false);
  const [activeNav, setActiveNav] = useState('Home');

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
                key={item.label}
                className={`nav-item ${activeNav === item.label ? 'nav-item--active' : ''}`}
                onClick={() => setActiveNav(item.label)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <main>
            <ErrorBoundary><KeyManager /></ErrorBoundary>
            <ErrorBoundary><PostBox /></ErrorBoundary>
            <ErrorBoundary><Feed /></ErrorBoundary>
          </main>
        </div>
      </AgeGate>
    </Web3Provider>
  );
}
