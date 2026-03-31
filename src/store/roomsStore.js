import { create } from 'zustand'

export const useRoomsStore = create((set, get) => ({
  rooms: [],
  activeRoomId: null,
  typingMap: {},
  onlineMap: {},

  setRooms: (rooms) => set({ rooms }),

  setActiveRoom: (id) => set({ activeRoomId: id }),

  addRoom: (room) => set((state) => ({
    rooms: state.rooms.find(r => r.id === room.id)
      ? state.rooms
      : [...state.rooms, room]
  })),

  updateRoom: (id, patch) => set((state) => ({
    rooms: state.rooms.map(r => r.id === id ? { ...r, ...patch } : r)
  })),

  setTyping: (roomId, fp, isTyping) => set((state) => ({
    typingMap: {
      ...state.typingMap,
      [roomId]: {
        ...(state.typingMap[roomId] || {}),
        [fp]: isTyping,
      }
    }
  })),

  setOnline: (fp, isOnline) => set((state) => ({
    onlineMap: { ...state.onlineMap, [fp]: isOnline }
  })),

  getActiveRoom: () => {
    const { rooms, activeRoomId } = get()
    return rooms.find(r => r.id === activeRoomId) || null
  },
}))
