import React, { useEffect, useState } from "react";
import AgeGate from "./components/AgeGate.jsx";
import Feed from "./components/Feed.jsx";
import PostBox from "./components/PostBox.jsx";
import KeyManager from "./components/KeyManager.jsx";
import { registerPeer } from "./api/gateway.js";
import { getPublicKey, isAgeVerifiedIdentity } from "./ConduitKeyManager.js";
import { isAgeVerified } from "./hooks/useAgeVerification.js";
import "./index.css";

export default function App() {
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    // Check if already age verified from a previous session
    if (isAgeVerified() && getPublicKey()) {
      setVerified(true);
    }
  }, []);

  useEffect(() => {
    if (verified) {
      const pubKey = getPublicKey();
      if (pubKey) registerPeer(pubKey).catch(() => {});
    }
  }, [verified]);

  if (!verified) {
    return <AgeGate onVerified={() => setVerified(true)} />;
  }

  return (
    <div className="app">
      <header>
        <h1>⚡ Conduit</h1>
        <p className="tagline">Communication without witnesses.</p>
      </header>
      <main>
        <KeyManager />
        <PostBox />
        <Feed />
      </main>
    </div>
  );
}
