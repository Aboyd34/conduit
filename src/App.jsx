import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home.jsx'
import AppPage from './pages/AppPage.jsx'
import DesignSystemPage from './pages/DesignSystemPage.jsx'
import RoomsView from './components/RoomsView.jsx'
import PulseView from './components/PulseView.jsx'
import PulsePlus from './components/pulse/PulsePlus.jsx'
import SignalKeyLogin, { loadSession, clearSession } from './components/SignalKeyLogin.jsx'

const demoPulses = [
  { id: '1', fingerprint: 'a1b2c3', room: 'general', action: 'signaled a post', preview: 'New system initialized', time: '2m ago' },
  { id: '2', fingerprint: 'd4e5f6', room: 'dev', action: 'replied to thread', preview: 'Framework discussion trending', time: '5m ago' },
  { id: '3', fingerprint: 'g7h8i9', room: 'aether', action: 'amplified', preview: 'Live dev signal detected', time: '8m ago' },
]

export default function App() {
  const [session, setSession] = useState(() => loadSession())

  function handleLogin(sessionData) {
    setSession(sessionData)
  }

  function handleLogout() {
    clearSession()
    setSession(null)
  }

  // Protected routes — require a Signal Key session
  const requireAuth = (element) => {
    if (!session) return <SignalKeyLogin onLogin={handleLogin} />
    return element
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/lab" element={<DesignSystemPage />} />

      {/* Protected */}
      <Route path="/app"        element={requireAuth(<AppPage />)} />
      <Route path="/rooms"      element={requireAuth(
        <RoomsView
          userRole={session?.role || 'user'}
          currentUser={session}
          onLogout={handleLogout}
        />
      )} />
      <Route path="/pulse"      element={requireAuth(<PulseView pulses={demoPulses} />)} />
      <Route path="/pulse-plus" element={requireAuth(<PulsePlus pulses={demoPulses} />)} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
