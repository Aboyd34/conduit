import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import SignalKeyLogin, { loadSession, clearSession } from './components/SignalKeyLogin.jsx'
import { useConduit } from './hooks/useConduit.js'
import { registerSW } from './registerSW.js'

// Views
import RoomsView      from './components/RoomsView.jsx'
import YouView        from './components/YouView.jsx'
import SearchView     from './components/SearchView.jsx'
import AdminDashboard from './components/AdminDashboard.jsx'
import DMView         from './components/DMView.jsx'
import PulseView      from './components/PulseView.jsx'
import ThreadView     from './components/ThreadView.jsx'
import Onboarding     from './components/Onboarding.jsx'
import NotificationsPanel from './components/NotificationsPanel.jsx'
import InstallBanner  from './components/InstallBanner.jsx'
import ProfileCard    from './components/ProfileCard.jsx'
import { AirdropPage } from './components/AirdropPage.jsx'

// Bottom nav
const NAV = [
  { path: '/rooms',   icon: '📶', label: 'Rooms'   },
  { path: '/pulse',   icon: '📡', label: 'Pulse'   },
  { path: '/search',  icon: '🔍', label: 'Search'  },
  { path: '/airdrop', icon: '⚡', label: 'Airdrop' },
  { path: '/you',     icon: '👤', label: 'You'     },
]

registerSW()

export default function App() {
  const [session, setSession]         = useState(() => loadSession())
  const [onboarded, setOnboarded]     = useState(() => !!localStorage.getItem('conduit_onboarded'))
  const [notifOpen, setNotifOpen]     = useState(false)
  const [profileFp, setProfileFp]     = useState(null)   // fingerprint to show in ProfileCard
  const [dmFp, setDmFp]               = useState(null)   // fingerprint to DM
  const [activeThread, setActiveThread] = useState(null) // { post, roomId }

  const conduit = useConduit()

  function handleLogin(s) { setSession(s) }
  function handleLogout() { clearSession(); setSession(null); setOnboarded(false) }
  function finishOnboarding() {
    localStorage.setItem('conduit_onboarded', '1')
    setOnboarded(true)
  }

  const isAdmin = session?.role === 'admin'

  // Require auth + onboarding wrapper
  function guard(el) {
    if (!session) return <SignalKeyLogin onLogin={handleLogin} />
    if (!onboarded) return <Onboarding session={session} onFinish={finishOnboarding} />
    return el
  }

  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/'

  return (
    <div style={{ background: '#07060f', minHeight: '100vh', color: '#e2e8f0' }}>

      {/* ── TOP NAV BAR ───────────────────────────────────── */}
      {session && onboarded && (
        <header style={topBar}>
          <span style={logoStyle}>⚡ CONDUIT</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isAdmin && (
              <a href="/admin" style={navPill}>🛡️ Admin</a>
            )}
            <button onClick={() => setNotifOpen(o => !o)} style={{ ...navPill, position: 'relative', cursor: 'pointer', border: 'none' }}>
              🔔
              {conduit.unreadCount > 0 && (
                <span style={badge}>{conduit.unreadCount > 9 ? '9+' : conduit.unreadCount}</span>
              )}
            </button>
          </div>
        </header>
      )}

      {/* ── ROUTES ────────────────────────────────────────── */}
      <div style={{ paddingTop: session && onboarded ? 52 : 0, paddingBottom: session && onboarded ? 64 : 0 }}>
        <Routes>
          <Route path="/" element={
            !session
              ? <SignalKeyLogin onLogin={handleLogin} />
              : !onboarded
              ? <Onboarding session={session} onFinish={finishOnboarding} />
              : <Navigate to="/rooms" />
          } />

          <Route path="/rooms" element={guard(
            <RoomsView
              userRole={session?.role || 'user'}
              currentUser={session}
              posts={conduit.posts}
              onAddPost={conduit.addPost}
              onRemovePost={conduit.removePost}
              onFlagPost={conduit.flagPost}
              onReact={conduit.reactToPost}
              onTyping={conduit.setTyping}
              typingMap={conduit.typingMap}
              onlineMap={conduit.onlineMap}
              onViewProfile={fp => setProfileFp(fp)}
              onOpenThread={(post, roomId) => setActiveThread({ post, roomId })}
              onDM={fp => setDmFp(fp)}
            />
          )} />

          <Route path="/pulse" element={guard(
            <PulseView
              posts={conduit.posts}
              onGoToRoom={room => { window.location.href = `/rooms?room=${room}` }}
              onViewProfile={fp => setProfileFp(fp)}
              onOpenThread={(post, roomId) => setActiveThread({ post, roomId })}
              onReact={conduit.reactToPost}
            />
          )} />

          <Route path="/search" element={guard(
            <SearchView
              posts={conduit.posts}
              onGoToRoom={room => { window.location.href = `/rooms?room=${room}` }}
            />
          )} />

          <Route path="/airdrop" element={guard(<AirdropPage />)} />

          <Route path="/you" element={guard(
            <YouView
              session={session}
              posts={conduit.posts}
              onLogout={handleLogout}
            />
          )} />

          <Route path="/admin" element={
            isAdmin ? guard(<AdminDashboard conduit={conduit} session={session} />) : <Navigate to="/rooms" />
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>

      {/* ── BOTTOM TAB BAR ───────────────────────────────── */}
      {session && onboarded && (
        <nav style={bottomNav}>
          {NAV.map(item => {
            const active = currentPath.startsWith(item.path)
            return (
              <a key={item.path} href={item.path} style={{ ...tab, color: active ? '#a78bfa' : 'rgba(255,255,255,0.3)' }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span style={{ fontSize: 9, marginTop: 2, fontFamily: 'monospace', letterSpacing: 0.5 }}>{item.label}</span>
              </a>
            )
          })}
        </nav>
      )}

      {/* ── OVERLAYS ─────────────────────────────────────── */}
      {notifOpen && (
        <NotificationsPanel
          notifications={conduit.notifications}
          onMarkRead={conduit.markAllRead}
          onClear={conduit.clearNotifications}
          onClose={() => setNotifOpen(false)}
        />
      )}

      {profileFp && (
        <ProfileCard
          fingerprint={profileFp}
          posts={conduit.posts}
          onClose={() => setProfileFp(null)}
          onDM={fp => { setProfileFp(null); setDmFp(fp) }}
        />
      )}

      {dmFp && (
        <DMView
          targetFp={dmFp}
          myFp={session?.fingerprint}
          onClose={() => setDmFp(null)}
        />
      )}

      {activeThread && (
        <ThreadView
          post={activeThread.post}
          roomId={activeThread.roomId}
          myFp={session?.fingerprint}
          onClose={() => setActiveThread(null)}
          onReact={conduit.reactToPost}
        />
      )}

      <InstallBanner />
    </div>
  )
}

const topBar = {
  position: 'fixed', top: 0, left: 0, right: 0, height: 52, zIndex: 200,
  background: 'rgba(7,6,15,0.97)', borderBottom: '1px solid #1e1c30',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '0 16px', backdropFilter: 'blur(12px)',
}
const logoStyle = {
  fontFamily: 'monospace', fontWeight: 900, fontSize: 15,
  color: '#7c3aed', letterSpacing: 3,
}
const navPill = {
  padding: '6px 12px', borderRadius: 8,
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: 'rgba(255,255,255,0.5)', fontSize: 13,
  textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4,
  fontFamily: 'monospace',
}
const badge = {
  position: 'absolute', top: 2, right: 2,
  background: '#7c3aed', color: '#fff',
  fontSize: 8, fontFamily: 'monospace', fontWeight: 700,
  padding: '1px 4px', borderRadius: 10, minWidth: 14, textAlign: 'center',
}
const bottomNav = {
  position: 'fixed', bottom: 0, left: 0, right: 0, height: 60, zIndex: 200,
  background: 'rgba(7,6,15,0.97)', borderTop: '1px solid #1e1c30',
  display: 'flex', alignItems: 'center', justifyContent: 'space-around',
  backdropFilter: 'blur(12px)',
}
const tab = {
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  justifyContent: 'center', flex: 1, height: '100%',
  textDecoration: 'none', transition: 'color 0.15s',
}
