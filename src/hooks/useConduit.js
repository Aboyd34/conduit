/**
 * useConduit — central app state hook
 * Provides: session, posts, notifications, typing indicators, online counts
 * All components import from here instead of managing their own state
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { loadSession } from '../components/SignalKeyLogin.jsx'

const STORAGE_KEY = 'conduit_posts_v2'
const NOTIF_KEY   = 'conduit_notifs_v1'

function loadPosts() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { return {} }
}
function savePosts(p) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)) } catch {}
}
function loadNotifs() {
  try { return JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]') } catch { return [] }
}
function saveNotifs(n) {
  try { localStorage.setItem(NOTIF_KEY, JSON.stringify(n)) } catch {}
}

export function useConduit() {
  const session = loadSession()
  const fp = session?.fingerprint || 'anon'

  const [posts, setPosts]             = useState(loadPosts)
  const [notifications, setNotifs]    = useState(loadNotifs)
  const [typingMap, setTypingMap]     = useState({}) // roomId → [fp, ...]
  const [onlineMap, setOnlineMap]     = useState({}) // roomId → count
  const [unreadCount, setUnreadCount] = useState(() => loadNotifs().filter(n => !n.read).length)

  // Persist posts whenever they change
  useEffect(() => { savePosts(posts) }, [posts])
  useEffect(() => {
    saveNotifs(notifications)
    setUnreadCount(notifications.filter(n => !n.read).length)
  }, [notifications])

  // Simulate live online counts (poll every 8s)
  useEffect(() => {
    function pulse() {
      setOnlineMap({
        general: Math.floor(Math.random() * 12) + 4,
        dev:     Math.floor(Math.random() * 6) + 2,
        privacy: Math.floor(Math.random() * 4) + 1,
        aether:  Math.floor(Math.random() * 3) + 1,
        random:  Math.floor(Math.random() * 8) + 2,
      })
    }
    pulse()
    const id = setInterval(pulse, 8000)
    return () => clearInterval(id)
  }, [])

  // Simulate ghost posts arriving (live feed feel, every 20–45s)
  const ghostTimerRef = useRef(null)
  useEffect(() => {
    const GHOST_SIGNALS = [
      { room: 'general', text: 'Signal locked. Who else is watching the latency charts tonight?' },
      { room: 'dev',     text: 'Hot reload just saved me 20 mins. Conduit architecture is clean.' },
      { room: 'random',  text: 'is it weird that i feel safer here than on any other platform' },
      { room: 'privacy', text: 'Reminder: metadata is the message. Encrypt everything.' },
      { room: 'general', text: 'No email. No phone number. Just a key. This is how it should be.' },
      { room: 'dev',     text: 'Anyone else notice the WebSocket reconnect is buttery smooth now?' },
    ]
    function dropGhost() {
      const sig = GHOST_SIGNALS[Math.floor(Math.random() * GHOST_SIGNALS.length)]
      const ghostFp = Math.random().toString(36).slice(2,6) + '·' + Math.random().toString(36).slice(2,6)
      const newPost = {
        id: `ghost_${Date.now()}`,
        fingerprint: ghostFp,
        text: sig.text,
        media: null,
        flagged: false,
        reactions: {},
        ts: Date.now(),
        ghost: true,
      }
      setPosts(prev => ({
        ...prev,
        [sig.room]: [newPost, ...(prev[sig.room] || [])].slice(0, 60),
      }))
      // Notify if it's a reply-like signal (20% chance)
      if (Math.random() < 0.2) {
        addNotification({ type: 'signal', from: ghostFp, room: sig.room, preview: sig.text.slice(0, 60) })
      }
      ghostTimerRef.current = setTimeout(dropGhost, 20000 + Math.random() * 25000)
    }
    ghostTimerRef.current = setTimeout(dropGhost, 12000)
    return () => clearTimeout(ghostTimerRef.current)
  }, [])

  // Typing indicator (broadcast for 2.5s then clear)
  const typingTimeouts = useRef({})
  function setTyping(roomId) {
    setTypingMap(prev => ({ ...prev, [roomId]: [...new Set([...(prev[roomId] || []), fp])] }))
    clearTimeout(typingTimeouts.current[roomId])
    typingTimeouts.current[roomId] = setTimeout(() => {
      setTypingMap(prev => ({ ...prev, [roomId]: (prev[roomId] || []).filter(f => f !== fp) }))
    }, 2500)
  }

  function addPost(roomId, text, media, authorFp) {
    const id = Date.now().toString()
    const newPost = { id, fingerprint: authorFp || fp, text, media, flagged: false, reactions: {}, ts: Date.now() }
    setPosts(prev => ({ ...prev, [roomId]: [newPost, ...(prev[roomId] || [])].slice(0, 60) }))
    return newPost
  }

  function removePost(roomId, postId) {
    setPosts(prev => ({
      ...prev,
      [roomId]: (prev[roomId] || []).map(p => p.id === postId ? { ...p, removed: true } : p)
    }))
  }

  function flagPost(roomId, postId) {
    setPosts(prev => ({
      ...prev,
      [roomId]: (prev[roomId] || []).map(p => p.id === postId ? { ...p, flagged: true } : p)
    }))
  }

  function reactToPost(roomId, postId, emoji) {
    setPosts(prev => ({
      ...prev,
      [roomId]: (prev[roomId] || []).map(p => {
        if (p.id !== postId) return p
        const reactions = { ...(p.reactions || {}) }
        reactions[emoji] = (reactions[emoji] || 0) + 1
        return { ...p, reactions }
      })
    }))
  }

  function addNotification(notif) {
    const n = { id: Date.now().toString(), read: false, ts: Date.now(), ...notif }
    setNotifs(prev => [n, ...prev].slice(0, 50))
  }

  function markAllRead() {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
  }

  function clearNotifications() {
    setNotifs([])
  }

  return {
    session, fp,
    posts, addPost, removePost, flagPost, reactToPost,
    notifications, unreadCount, addNotification, markAllRead, clearNotifications,
    typingMap, setTyping,
    onlineMap,
  }
}
