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

export default function App() {
  const [peerRegistered, setPeerRegistered] = useState(false);

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
        <div className="app">
          <header>
            <h1>⚡ Conduit</h1>
            <p className="tagline">Communication without witnesses.</p>
          </header>
          <ErrorBoundary>
            <WalletConnect />
          </ErrorBoundary>
          <main>
            <ErrorBoundary>
              <KeyManager />
            </ErrorBoundary>
            <ErrorBoundary>
              <PostBox />
            </ErrorBoundary>
            <ErrorBoundary>
              <Feed />
            </ErrorBoundary>
          </main>
        </div>
      </AgeGate>
    </Web3Provider>
  );
}
