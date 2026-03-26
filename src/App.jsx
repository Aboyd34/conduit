import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import AppPage from './pages/AppPage.jsx'
import DesignSystemPage from './pages/DesignSystemPage.jsx'
import RoomsView from './components/RoomsView.jsx'
import PulseView from './components/PulseView.jsx'
import PulsePlus from './components/pulse/PulsePlus.jsx'

// Demo data — replace with real props/context later
const demoRoom = {
  room: 'general',
  online: 42,
  tools: [
    { id: '1', label: 'Signal Board' },
    { id: '2', label: 'Code Snippets' },
    { id: '3', label: 'Resources' },
  ],
  posts: [
    { id: '1', fingerprint: 'a1b2c3d4', text: 'Welcome to the general room.' },
    { id: '2', fingerprint: 'e5f6g7h8', text: 'Conduit is live and building.' },
  ],
  trending: ['#conduit', '#aether', '#web3', '#privacy'],
  resources: ['Docs', 'GitHub', 'Whitepaper'],
}

const demoPulses = [
  { id: '1', fingerprint: 'a1b2c3', room: 'general', action: 'signaled a post', preview: 'New system initialized', time: '2m ago' },
  { id: '2', fingerprint: 'd4e5f6', room: 'dev', action: 'replied to thread', preview: 'Framework discussion trending', time: '5m ago' },
  { id: '3', fingerprint: 'g7h8i9', room: 'aether', action: 'amplified', preview: 'Live dev signal detected', time: '8m ago' },
]

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/app" element={<AppPage />} />
      <Route path="/lab" element={<DesignSystemPage />} />
      <Route path="/rooms" element={<RoomsView {...demoRoom} />} />
      <Route path="/pulse" element={<PulseView pulses={demoPulses} />} />
      <Route path="/pulse-plus" element={<PulsePlus pulses={demoPulses} />} />
      <Route path="*" element={<Home />} />
    </Routes>
  )
}
