import { useState, useEffect } from 'react'
import AgeGate from '../components/AgeGate.jsx'
import Nav from '../components/Nav.jsx'
import { RoomsView } from '../components/RoomsView.jsx'
import PulseView from '../components/PulseView.jsx'
import SearchView from '../components/SearchView.jsx'
import YouView from '../components/YouView.jsx'
import WalletConnect from '../components/WalletConnect.jsx'

const AGE_KEY = 'conduit_age_verified'

export default function AppPage() {
  const [verified, setVerified] = useState(false)
  const [view, setView] = useState('rooms')
  const [profileId, setProfileId] = useState(null)

  useEffect(() => {
    setVerified(!!localStorage.getItem(AGE_KEY))
  }, [])

  if (!verified) return <AgeGate onVerify={() => setVerified(true)} />

  function renderView() {
    switch (view) {
      case 'rooms':  return <RoomsView onViewProfile={(id) => { setProfileId(id); setView('you') }} />
      case 'pulse':  return <PulseView />
      case 'search': return <SearchView onViewProfile={(id) => { setProfileId(id); setView('you') }} />
      case 'you':    return <YouView profileId={profileId} onBack={() => setView('rooms')} />
      default:       return <RoomsView onViewProfile={(id) => { setProfileId(id); setView('you') }} />
    }
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#07060f' }}>
      <Nav view={view} setView={setView} />
      <div className="flex-1 overflow-y-auto">
        {renderView()}
      </div>
      <WalletConnect />
    </div>
  )
}
