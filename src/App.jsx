import React, { useState, lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useSessionStore } from './store/sessionStore.js'
import { useConduit } from './hooks/useConduit.js'
import { registerSW } from './registerSW.js'

// Layout — always loaded
import Header from './components/Header.jsx'
import LeftRail from './components/LeftRail.jsx

// Overlays — always loaded (small)
import NotificationsPanel from './components/NotificationsPanel.jsx'
import ProfileCard        from './components/ProfileCard.jsx'
import InstallBanner      from './components/InstallBanner.jsx'
import SignalKeyLogin     from './components/SignalKeyLogin.jsx'
import Onboarding         from './components/Onboarding.jsx'

// Lazy-loaded routes
const RoomsView   = lazy(() => import('./components/RoomsView.jsx'))
const PulseView   = lazy(() => import('./components/PulseView.jsx'))
const SearchView  = lazy(() => import('./components/SearchView.jsx'))
const YouView     = lazy(() => import('./components/YouView.jsx'))
const DMView      = lazy(() => import('./components/DMView.jsx'))
const ThreadView  = lazy(() => import('./components/ThreadView.jsx'))
const AetherAI    = lazy(() => import('./components/AetherAI.jsx'))
const AdminShell  = lazy(() => import('./components/AdminShell.jsx'))
const AirdropPage = lazy(() => import('./components/AirdropPage.jsx').then(m => ({ default: m.AirdropPage })))

const ROUTE_TITLES = {
  '/rooms':   'Rooms',
  '/pulse':   'Feed',
  '/search':  'Search',
  '/airdrop': 'Airdrop',
  '/you':     'You',
  '/ai':      'AI — Aether',
  '/admin':   'Admin',
}

function Loader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '60vh', color: 'var(--text-muted)',
      fontFamily: 'var(--font-mono)', fontSize: 12,
    }}>
      <span className="animate-pulse">Loading…</span>
    </div>
  )
}

registerSW()

export default function App() {
  const { session, onboarded, login, logout, finishOnboarding } = useSessionStore()
  const [notifOpen, setNotifOpen]       = useState(false)
  const [profileFp, setProfileFp]       = useState(null)
  const [dmFp, setDmFp]                 = useState(null)
  const [activeThread, setActiveThread] = useState(null)

  const conduit  = useConduit()
  const location = useLocation()

  const pageTitle = ROUTE_TITLES[location.pathname] || 'Conduit'
  const isAdmin   = session?.role === 'admin'
  const navMode   = location.pathname.startsWith('/admin') ? 'admin' : 'user'
  const activeNav = location.pathname.replace('/', '') || 'rooms'
  const unread    = conduit.unreadCount || 0

  function goTo(id) { window.location.href = `/${id}` }

  function guard(el) {
    if (!session)   return <SignalKeyLogin onLogin={login} />
    if (!onboarded) return <Onboarding session={session} onFinish={finishOnboarding} />
    return el
  }

  const rightSlot = session && onboarded ? (
    <>
      <button
        onClick={() => setNotifOpen(o => !o)}
        style={{
          position: 'relative', background: 'transparent', border: 'none',
          color: 'var(--text-secondary)', cursor: 'pointer',
          padding: '6px 8px', borderRadius: 'var(--radius-sm)', fontSize: 16,
        }}
      >
        🔔
        {unread > 0 && (
          <span className="badge" style={{ position: 'absolute', top: 2, right: 2 }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      <span className="chip mono">
        {session.fingerprint ? session.fingerprint.slice(0, 8) : '??'}
      </span>
    </>
  ) : null

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text-primary)' }}>

      {session && onboarded && (
        <Header title={pageTitle} rightSlot={rightSlot} />
      )}

      <div style={{
        display: 'flex',
        paddingTop: session && onboarded ? 'var(--topbar-height)' : 0,
      }}>
        {session && onboarded && (
          <aside style={{
            width: 'var(--rail-width)',
            background: 'var(--surface)',
            borderRight: '1px solid var(--border)',
            position: 'fixed',
            top: 'var(--topbar-height)',
            left: 0,
            bottom: 0,
            overflowY: 'auto',
            zIndex: 50,
          }}>
           <LeftRail 
             mode={navMode} 
             active={activeNav} 
             onNav={goTo} 
             badges={{ direct: unread }} 
          />
          </aside>
        )}

        <main style={{
          flex: 1,
          marginLeft: session && onboarded ? 'var(--rail-width)' : 0,
          minHeight: '100vh',
        }}>
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="/" element={
                !session
                  ? <SignalKeyLogin onLogin={login} />
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

              <Route path="/search"  element={guard(<SearchView posts={conduit.posts} onGoToRoom={r => { window.location.href = `/rooms?room=${r}` }} />)} />
              <Route path="/airdrop" element={guard(<AirdropPage />)} />
              <Route path="/you"     element={guard(<YouView session={session} posts={conduit.posts} onLogout={logout} />)} />
              <Route path="/ai"      element={guard(<AetherAI session={session} />)} />

              <Route path="/admin" element={
                isAdmin
                  ? guard(<AdminShell conduit={conduit} session={session} />)
                  : <Navigate to="/rooms" />
              } />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
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
      <Suspense fallback={null}>
        {dmFp && (
          <DMView targetFp={dmFp} myFp={session?.fingerprint} onClose={() => setDmFp(null)} />
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
      </Suspense>

      <InstallBanner />
    </div>
  )
}
