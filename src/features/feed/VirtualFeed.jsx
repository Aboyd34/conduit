import React, { memo, useCallback, useRef, useEffect, useState } from 'react'
import FeedCard from '../../components/FeedCard.jsx'

const ITEM_HEIGHT = 220 // estimated avg card height
const OVERSCAN    = 5  // render N extra items above/below viewport

const MemoCard = memo(({ post, onReact, onViewProfile, onOpenThread, onDM }) => (
  <FeedCard post={post} onReact={onReact} onViewProfile={onViewProfile} onOpenThread={onOpenThread} onDM={onDM} />
))

/**
 * VirtualFeed — lightweight virtual list for feed posts.
 * Uses IntersectionObserver to avoid heavy react-window dependency.
 * Cards are rendered in a windowed slice based on scroll position.
 */
export default function VirtualFeed({ posts = [], onReact, onViewProfile, onOpenThread, onDM }) {
  const containerRef  = useRef(null)
  const [slice, setSlice] = useState({ start: 0, end: 20 })

  const updateSlice = useCallback(() => {
    if (!containerRef.current) return
    const { scrollTop, clientHeight } = containerRef.current
    const start = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN)
    const end   = Math.min(posts.length, Math.ceil((scrollTop + clientHeight) / ITEM_HEIGHT) + OVERSCAN)
    setSlice({ start, end })
  }, [posts.length])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('scroll', updateSlice, { passive: true })
    updateSlice()
    return () => el.removeEventListener('scroll', updateSlice)
  }, [updateSlice])

  const totalHeight = posts.length * ITEM_HEIGHT
  const offsetTop   = slice.start * ITEM_HEIGHT

  return (
    <div
      ref={containerRef}
      style={{
        height: '100%',
        overflowY: 'auto',
        position: 'relative',
        padding: '16px',
        boxSizing: 'border-box',
      }}
    >
      {/* Spacer to maintain scroll height */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ position: 'absolute', top: offsetTop, width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {posts.slice(slice.start, slice.end).map(post => (
            <MemoCard
              key={post.id}
              post={post}
              onReact={onReact}
              onViewProfile={onViewProfile}
              onOpenThread={onOpenThread}
              onDM={onDM}
            />
          ))}
        </div>
      </div>

      {posts.length === 0 && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 10, color: 'var(--text-muted)',
        }}>
          <span style={{ fontSize: 32, opacity: 0.4 }}>📶</span>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>No signals yet.</p>
        </div>
      )}
    </div>
  )
}
