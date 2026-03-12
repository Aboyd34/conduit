import React, { useState, useEffect } from "react";
import { generateAndStoreKeys, deleteKeys, getPublicKey } from "../ConduitKeyManager.js";

export default function KeyManager() {
  const [pubKey, setPubKey] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    setPubKey(getPublicKey());
  }, []);

  const handleGenerate = async () => {
    try {
      const key = await generateAndStoreKeys();
      setPubKey(key);
      setStatus("✅ New key pair generated.");
    } catch (e) {
      setStatus("❌ " + e.message);
    }
  };

  const handleDelete = () => {
    deleteKeys();
    setPubKey(null);
    setStatus("🗑️ Keys deleted.");
  };

  return (
    <div className="key-manager">
      <h3>🔐 Identity</h3>
      {pubKey ? (
        <>
          <p className="pubkey">Public Key: {pubKey}</p>
          <button onClick={handleDelete}>Delete Keys</button>
        </>
      ) : (
        <button onClick={handleGenerate}>Generate Keys</button>
      )}
      {status && <p className="status">{status}</p>}
    </div>
  );
}
