import React, { useState, useEffect } from 'react';
import AgeGate from '../components/AgeGate.jsx';
import Onboarding from '../components/Onboarding.jsx';
import Nav from '../components/Nav.jsx';
import RoomsView from '../components/RoomsView.jsx';
import PulseView from '../components/PulseView.jsx';
import SearchView from '../components/SearchView.jsx';
import YouView from '../components/YouView.jsx';
import AetherAI from '../components/AetherAI.jsx';
import { AirdropPage } from '../components/AirdropPage.jsx';
import { Web3Provider } from '../providers/Web3Provider.jsx';

const AGE_KEY     = 'conduit_age_verified';
const ONBOARD_KEY = 'conduit_onboarded';

export default function AppPage() {
  const [verified,  setVerified]  = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [view,      setView]      = useState('rooms');
  const [profileId, setProfileId] = useState(null);
  const [pulses,    setPulses]    = useState([]);

  useEffect(() => {
    setVerified(!!localStorage.getItem(AGE_KEY));
    setOnboarded(!!localStorage.getItem(ONBOARD_KEY));
  }, []);

  if (!verified)  return <AgeGate onVerify={() => setVerified(true)} />;
  if (!onboarded) return <Onboarding onDone={() => setOnboarded(true)} />;

  function renderView() {
    switch (view) {
      case 'rooms':   return <RoomsView onViewProfile={(id) => { setProfileId(id); setView('you'); }} />;
      case 'pulse':   return <PulseView pulses={pulses} />;
      case 'search':  return <SearchView onViewProfile={(id) => { setProfileId(id); setView('you'); }} />;
      case 'you':     return <YouView profileId={profileId} onBack={() => setView('rooms')} />;
      case 'ai':      return <AetherAI />;
      case 'airdrop': return <AirdropPage />;
      default:        return <RoomsView onViewProfile={(id) => { setProfileId(id); setView('you'); }} />;
    }
  }

  return (
    <Web3Provider>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#07060f' }}>
        <Nav view={view} setView={setView} />
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {renderView()}
        </div>
      </div>
    </Web3Provider>
  );
}
