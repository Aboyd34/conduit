import { create } from 'zustand'

export const usePostsStore = create((set, get) => ({
  posts: [],
  pendingBuffer: [],

  // Set all posts (initial load)
  setPosts: (posts) => set({ posts }),

  // Add single post — deduplicated
  addPost: (post) => set((state) => {
    if (state.posts.find(p => p.id === post.id)) return state
    return { posts: [post, ...state.posts] }
  }),

  // Buffer incoming real-time posts, flush every 100ms
  bufferPost: (post) => set((state) => ({
    pendingBuffer: [...state.pendingBuffer, post]
  })),

  flushBuffer: () => set((state) => {
    if (!state.pendingBuffer.length) return state
    const existing = new Set(state.posts.map(p => p.id))
    const newPosts = state.pendingBuffer.filter(p => !existing.has(p.id))
    return {
      posts: [...newPosts, ...state.posts],
      pendingBuffer: [],
    }
  }),

  removePost: (id) => set((state) => ({
    posts: state.posts.filter(p => p.id !== id)
  })),

  reactToPost: (id, reaction) => set((state) => ({
    posts: state.posts.map(p =>
      p.id === id
        ? { ...p, reactions: { ...(p.reactions || {}), [reaction]: ((p.reactions || {})[reaction] || 0) + 1 } }
        : p
    )
  })),

  flagPost: (id) => set((state) => ({
    posts: state.posts.map(p =>
      p.id === id ? { ...p, flagged: true } : p
    )
  })),
}))
