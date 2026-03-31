import { useEffect, useCallback } from 'react'
import { useRoomsStore } from '../../store/roomsStore.js'
import { usePostsStore } from '../../store/postsStore.js'

/**
 * useRooms — feature hook for rooms logic
 * Decouples rooms state from UI components
 */
export function useRooms(conduit) {
  const {
    rooms, activeRoomId,
    setRooms, setActiveRoom, addRoom, updateRoom,
    setTyping, setOnline, getActiveRoom,
    typingMap, onlineMap,
  } = useRoomsStore()

  const { posts, addPost, removePost, reactToPost, flagPost } = usePostsStore()

  // Sync from conduit hook (WS layer) into stores
  useEffect(() => {
    if (!conduit) return
    if (conduit.posts?.length) {
      // Only hydrate if store is empty
      usePostsStore.getState().posts.length === 0 &&
        usePostsStore.setState({ posts: conduit.posts })
    }
  }, [conduit?.posts])

  const switchRoom = useCallback((id) => {
    setActiveRoom(id)
  }, [setActiveRoom])

  const activeRoom = getActiveRoom()
  const activePosts = posts.filter(p => !activeRoomId || p.roomId === activeRoomId)

  const typingUsers = activeRoomId
    ? Object.entries(typingMap[activeRoomId] || {})
        .filter(([, isTyping]) => isTyping)
        .map(([fp]) => fp.slice(0, 6))
    : []

  return {
    rooms,
    activeRoom,
    activeRoomId,
    activePosts,
    typingUsers,
    onlineMap,
    switchRoom,
    addRoom,
    updateRoom,
    addPost,
    removePost,
    reactToPost,
    flagPost,
    setTyping,
  }
}
