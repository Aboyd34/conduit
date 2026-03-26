import { useState, useEffect } from 'react'

const ADMIN_KEY = 'conduit_admin_role'
const ADMIN_HASH = 'Q2xhdWRldHRlLUFudGhvbnktVXM=' // base64 of passphrase

function hashPass(pass) {
  return btoa(pass)
}

export function useAdminAuth() {
  const [role, setRole] = useState(() => {
    return localStorage.getItem(ADMIN_KEY) || 'user'
  })

  function attemptAdmin(passphrase) {
    if (hashPass(passphrase.trim()) === ADMIN_HASH) {
      localStorage.setItem(ADMIN_KEY, 'admin')
      setRole('admin')
      return true
    }
    return false
  }

  function revokeAdmin() {
    localStorage.removeItem(ADMIN_KEY)
    setRole('user')
  }

  return { role, attemptAdmin, revokeAdmin, isAdmin: role === 'admin' }
}
