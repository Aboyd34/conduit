import React, { useEffect, useRef, memo } from 'react'
import FeedCard from '../../components/FeedCard.jsx'

// Memoized single post row — only re-renders if post changes
const PostRow = memo(function PostRow({ post, onReact, onViewProfile, onOpenThread, onDM }) {
  return (
    <FeedCard
      post={post}
      onReact={onReact}
      onViewProfile={onViewProfile}
      onOpenThread={onOpenThread}
      onDM={onDM}
    />
  )
})

export default function RoomTimeline({
  posts = [],
  roomId,
  typingUsers = [],
  onReact,
  onViewProfile,
  onOpenThread,
  onDM,
}) {
  const bottomRef = useRef(null)

  // Auto-scroll to bottom on new posts
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [posts.length])

  const roomPosts = posts.filter(p => p.roomId === roomId || !roomId)

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      {roomPosts.length === 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 24px',
          gap: 10,
          opacity: 0.5,
        }}>
          <span style={{ fontSize: 32 }}>📶</span>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            No signals yet. Be the first.
          </p>
        </div>
      )}

      {roomPosts.map(post => (
        <PostRow
          key={post.id}
          post={post}
          onReact={onReact}
          onViewProfile={onViewProfile}
          onOpenThread={onOpenThread}
          onDM={onDM}
        />
      ))}

      {/* Typing indicators */}
      {typingUsers.length > 0 && (
        <div style={{
          fontSize: 11,
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          padding: '4px 8px',
          animation: 'pulse 1.5s ease infinite',
        }}>
          {typingUsers.slice(0, 3).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing…
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
