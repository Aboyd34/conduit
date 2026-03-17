import { useState, useEffect } from 'react'
import AgeGate from '../components/AgeGate.jsx'
import Nav from '../components/Nav.jsx'
import RoomList from '../components/RoomList.jsx'
import Feed from '../components/Feed.jsx'
import ToolsPanel from '../components/ToolsPanel.jsx'
import IntelPanel from '../components/IntelPanel.jsx'
import IdentityPanel from '../components/IdentityPanel.jsx'

const AGE_KEY = 'conduit_age_verified'

export default function AppPage() {
  const [verified, setVerified] = useState(false)
  const [view, setView] = useState('rooms')

  useEffect(() => {
    setVerified(!!localStorage.getItem(AGE_KEY))
  }, [])

  if (!verified) return <AgeGate onVerify={() => setVerified(true)} />

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#07060f' }}>
      <Nav view={view} setView={setView} />
      <RoomList />
      <ToolsPanel />
      <Feed />
      <IntelPanel />
      <IdentityPanel />
    </div>
  )
}
