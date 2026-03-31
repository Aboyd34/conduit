import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { loadSession, clearSession } from '../components/SignalKeyLogin.jsx'

export const useSessionStore = create(
  persist(
    (set) => ({
      session: loadSession(),
      onboarded: !!localStorage.getItem('conduit_onboarded'),

      login: (session) => set({ session }),

      logout: () => {
        clearSession()
        localStorage.removeItem('conduit_onboarded')
        set({ session: null, onboarded: false })
      },

      finishOnboarding: () => {
        localStorage.setItem('conduit_onboarded', '1')
        set({ onboarded: true })
      },
    }),
    { name: 'conduit-session', partialize: (s) => ({ onboarded: s.onboarded }) }
  )
)
