/**
 * AgeGate — Full-screen age verification wall
 * Wrap any route or component: <AgeGate><YourComponent /></AgeGate>
 */

import React from 'react';
import { useAgeGate } from './useAgeGate';
import './AgeGate.css';

export function AgeGate({ children, minAge = 18 }) {
  const { verified, confirm, pending } = useAgeGate();

  if (pending) return null; // avoid flash

  if (verified) return <>{children}</>;

  return (
    <div className="age-gate-overlay">
      <div className="age-gate-card">
        <div className="age-gate-logo">⚡ Conduit</div>
        <h1 className="age-gate-title">Age Verification Required</h1>
        <p className="age-gate-body">
          This platform contains content intended for adults aged {minAge} and older.
          By continuing, you confirm that you are at least {minAge} years of age.
        </p>
        <p className="age-gate-disclaimer">
          Your age is self-attested and stored locally on your device only.
          No personal data is collected or transmitted.
        </p>
        <div className="age-gate-actions">
          <button
            className="age-gate-btn age-gate-btn--confirm"
            onClick={confirm}
          >
            I am {minAge}+ years old — Enter
          </button>
          <a
            href="https://www.google.com"
            className="age-gate-btn age-gate-btn--deny"
          >
            I am under {minAge} — Exit
          </a>
        </div>
        <p className="age-gate-legal">
          By entering you agree to our{' '}
          <a href="/terms" target="_blank" rel="noreferrer">Terms of Service</a>{' '}
          and confirm you meet the age requirement.
        </p>
      </div>
    </div>
  );
}

export default AgeGate;
