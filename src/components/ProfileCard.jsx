import React, { useState, useMemo, useEffect } from 'react'
import { getProfile } from './UserProfile.jsx'

const ROOM_COLORS = { general:'#5b8cff', dev:'#9b5cff', privacy:'#00ffc3', aether:'#ffd700', random:'#ff6b6b' }
const ROOMS = ['general','dev','privacy','aether','random']

export default function ProfileCard({ fingerprint, posts = {}, onClose, onDM }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 720)

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 720)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const profile = getProfile(fingerprint) || {}
  const handle  = profile.handle || fingerprint?.slice(0,10) + '…'
  const bio     = profile.bio || ''

  const myPosts = useMemo(() => {
    return ROOMS.flatMap(room =>
      (posts[room] || [])
        .filter(p => p.fingerprint === fingerprint && !p.removed)
        .map(p => ({ ...p, room }))
    )
    .sort((a,b) => (b.ts || 0) - (a.ts || 0))
    .slice(0, 10)
  }, [posts, fingerprint])

  const totalReactions = useMemo(() => {
    return myPosts.reduce((sum, p) => {
      return sum + Object.values(p.reactions || {}).reduce((a,b)=>a+b,0)
    }, 0)
  }, [myPosts])

  return (
    <>
      {/* Backdrop */}
      <div className="profile-backdrop" onClick={onClose} />

      {/* MOBILE: Slide-up drawer */}
      {isMobile && (
        <div className="profile-drawer">
          <div className="profile-grabber" />

          <ProfileContent
            handle={handle}
            bio={bio}
            fingerprint={fingerprint}
            myPosts={myPosts}
            totalReactions={totalReactions}
            onDM={onDM}
            onClose={onClose}
          />
        </div>
      )}

      {/* DESKTOP: Right-side operator panel */}
      {!isMobile && (
        <div className="profile-panel">
          <ProfileContent
            handle={handle}
            bio={bio}
            fingerprint={fingerprint}
            myPosts={myPosts}
            totalReactions={totalReactions}
            onDM={onDM}
            onClose={onClose}
          />
        </div>
      )}
    </>
  )
}

function ProfileContent({ handle, bio, fingerprint, myPosts, totalReactions, onDM, onClose }) {
  return (
    <div className="profile-content">
      {/* Header */}
      <div className="profile-header">
        <div className="profile-avatar">{handle[0]?.toUpperCase()}</div>

        <div className="profile-meta">
          <div className="profile-handle">{handle}</div>
          {bio && <p className="profile-bio">{bio}</p>}
          <div className="profile-fp">{fingerprint}</div>
        </div>

        <button className="profile-close" onClick={onClose}>×</button>
      </div>

      {/* Stats */}
      <div className="profile-stats">
        <div className="profile-stat">
          <div className="profile-stat-value">{myPosts.length}</div>
          <div className="profile-stat-label">Signals</div>
        </div>

        <div className="profile-stat">
          <div className="profile-stat-value">{totalReactions}</div>
          <div className="profile-stat-label">Reactions</div>
        </div>

        <button className="profile-dm" onClick={() => onDM(fingerprint)}>
          ✉️ DM
        </button>
      </div>

      {/* Recent posts */}
      {myPosts.length > 0 && (
        <>
          <div className="profile-section-label">RECENT SIGNALS</div>

          <div className="profile-posts">
            {myPosts.slice(0,5).map(p => (
              <div
                key={p.id}
                className="profile-post"
                style={{ borderColor: (ROOM_COLORS[p.room] || '#a78bfa') + '33' }}
              >
                <div
                  className="profile-post-room"
                  style={{ color: ROOM_COLORS[p.room] || '#a78bfa' }}
                >
                  #{p.room}
                </div>

                <p className="profile-post-text">{p.text}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
