import React, { useEffect } from "react";
import Feed from "./components/Feed.jsx";
import PostBox from "./components/PostBox.jsx";
import KeyManager from "./components/KeyManager.jsx";
import { registerPeer } from "./api/gateway.js";
import { getPublicKey } from "./ConduitKeyManager.js";
import "./index.css";

export default function App() {
  useEffect(() => {
    const pubKey = getPublicKey();
    if (pubKey) registerPeer(pubKey).catch(() => {});
  }, []);

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
