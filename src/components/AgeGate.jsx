import React, { useState } from "react";
import { launchAgeIDVerification, storeAgeToken } from "../hooks/useAgeVerification.js";
import { generateAndStoreKeys } from "../ConduitKeyManager.js";

export default function AgeGate({ onVerified }) {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    setStatus("Launching AgeID verification...");

    launchAgeIDVerification(async (token) => {
      try {
        await storeAgeToken(token);
        setStatus("✅ Age verified. Generating your identity...");
        await generateAndStoreKeys(token);
        setStatus("✅ Identity created. Welcome to Conduit.");
        setTimeout(() => onVerified(), 1000);
      } catch (e) {
        setStatus("❌ Error: " + e.message);
        setLoading(false);
      }
    });
  };

  return (
    <div className="age-gate">
      <div className="age-gate-card">
        <h1>⚡ Conduit</h1>
        <p className="age-gate-tagline">Communication without witnesses.</p>

        <div className="age-gate-notice">
          <h2>Age Verification Required</h2>
          <p>
            Conduit is for users <strong>18 and older</strong>. We use AgeID to
            verify your age anonymously — no personal data is stored by Conduit.
          </p>
          <ul>
            <li>✅ Your age is verified, not your identity</li>
            <li>✅ No name, email, or ID stored on our servers</li>
            <li>✅ Your AgeID token becomes your reusable Conduit identity</li>
            <li>✅ Same token = same identity on any device</li>
          </ul>
        </div>

        {status && <p className="age-gate-status">{status}</p>}

        <button
          onClick={handleVerify}
          disabled={loading}
          className="age-gate-btn"
        >
          {loading ? "Verifying..." : "Verify Age with AgeID"}
        </button>

        <p className="age-gate-legal">
          By continuing you confirm you are 18 or older and agree to our{" "}
          <a href="/terms" target="_blank">Terms</a>. Protected under COPPA and applicable state law.
        </p>
      </div>
    </div>
  );
}
