import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import SignalKeyLogin, { loadSession, clearSession } from './components/SignalKeyLogin.jsx'
import { useConduit } from './hooks/useConduit.js'
import { registerSW } from './registerSW.js'

// Layout
import TopBar    from './components/TopBar.jsx'
import NavRail   from './components/NavRail.jsx'

// Views
import RoomsView          from './components/RoomsView.jsx'
import YouView            from './components/YouView.jsx'
import SearchView         from './components/SearchView.jsx'
import AdminShell         from './components/AdminShell.jsx'
import DMView             from './components/DMView.jsx'
import PulseView          from './components/PulseView.jsx'
import ThreadView         from './components/ThreadView.jsx'
import Onboarding         from './components/Onboarding.jsx'
import NotificationsPanel from './components/NotificationsPanel.jsx'
import InstallBanner      from './components/InstallBanner.jsx'
import ProfileCard        from './components/ProfileCard.jsx'
import { AirdropPage }   from './components/AirdropPage.jsx'
import AetherAI          from './components/AetherAI.jsx'

registerSW()

const ROUTE_TITLES = {
  '/rooms':   'Rooms',
  '/pulse':   'Feed',
  '/search':  'Search',
  '/airdrop': 'Airdrop',
  '/you':     'You',
  '/ai':      'AI',
  '/admin':   'Admin',
}

export default function App() {
  const [session, setSession]           = useState(() => loadSession())
  const [onboarded, setOnboarded]       = useState(() => !!localStorage.getItem('conduit_onboarded'))
  const [notifOpen, setNotifOpen]       = useState(false)
  const [profileFp, setProfileFp]       = useState(null)
  const [dmFp, setDmFp]                 = useState(null)
  const [activeThread, setActiveThread] = useState(null)

  const conduit = useConduit()

  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/rooms'
  const pageTitle   = ROUTE_TITLES[currentPath] || 'Conduit'
  const isAdmin     = session?.role === 'admin'

  function handleLogin(s)  { setSession(s) }
  function handleLogout()  { clearSession(); setSession(null); setOnboarded(false) }
  function finishOnboarding() {
    localStorage.setItem('conduit_onboarded', '1')
    setOnboarded(true)
  }

  function guard(el) {
    if (!session)  return <SignalKeyLogin onLogin={handleLogin} />
    if (!onboarded) return <Onboarding session={session} onFinish={finishOnboarding} />
    return el
  }

  const navMode = currentPath.startsWith('/admin') ? 'admin' : 'user'
  const activeNav = currentPath.replace('/', '') || 'rooms'

  function goTo(id) {
    window.location.href = `/${id}`
  }

  const unread = conduit.unreadCount || 0

  const rightSlot = session && onboarded ? (
    <>
      <button
        onClick={() => setNotifOpen(o => !o)}
        style={{
          position: 'relative', background: 'transparent', border: 'none',
          color: 'var(--text-secondary)', cursor: 'pointer', padding: '6px 8px',
          borderRadius: 'var(--radius-sm)', fontSize: 16,
        }}
      >
        🔔
        {unread > 0 && (
          <span className="badge" style={{ position: 'absolute', top: 2, right: 2 }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      <div className="chip">
        {session.fingerprint ? session.fingerprint.slice(0, 6) : '??'}
      </div>
    </>
  ) : null

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text-primary)' }}>

      {session && onboarded && (
        <TopBar title={pageTitle} rightSlot={rightSlot} />
      )}

      <div style={{
        display: 'flex',
        paddingTop: session && onboarded ? 'var(--topbar-height)' : 0,
      }}>

        {/* Left Rail */}
        {session && onboarded && (
          <aside style={{
            width: 'var(--rail-width)',
            minHeight: 'calc(100vh - var(--topbar-height))',
            background: 'var(--surface)',
            borderRight: '1px solid var(--border)',
            position: 'fixed',
            top: 'var(--topbar-height)',
            left: 0,
            bottom: 0,
            overflowY: 'auto',
            zIndex: 50,
          }}>
            <NavRail
              mode={navMode}
              active={activeNav}
              onNav={goTo}
              badges={{ direct: unread }}
            />
          </aside>
        )}

        {/* Main content */}
        <main style={{
          flex: 1,
          marginLeft: session && onboarded ? 'var(--rail-width)' : 0,
          padding: session && onboarded ? '24px' : 0,
          minHeight: '100vh',
        }}>
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

            <Route path="/ai" element={guard(<AetherAI session={session} />)} />

            <Route path="/admin" element={
              isAdmin
                ? guard(<AdminShell conduit={conduit} session={session} />)
                : <Navigate to="/rooms" />
            } />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>

      {/* Overlays */}
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
