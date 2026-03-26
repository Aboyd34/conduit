import React, { useState, useEffect } from 'react'
import { setupInstallPrompt, triggerInstall } from '../registerSW.js'

export default function InstallBanner() {
  const [show, setShow]       = useState(false)
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('conduit_install_dismissed') === '1'
  )

  useEffect(() => {
    if (dismissed) return
    setupInstallPrompt(() => setShow(true))
  }, [dismissed])

  function dismiss() {
    setShow(false)
    setDismissed(true)
    localStorage.setItem('conduit_install_dismissed', '1')
  }

  if (!show || dismissed) return null

  return (
    <div style={{
      position: 'fixed', bottom: 72, left: 16, right: 16,
      background: 'linear-gradient(135deg,#0f0e1a,#1a1040)',
      border: '1px solid rgba(124,58,237,0.35)',
      borderRadius: 14, padding: '14px 16px',
      display: 'flex', alignItems: 'center', gap: 12,
      zIndex: 500, boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
    }}>
      <span style={{ fontSize: 26 }}>⚡</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13, color: '#e2e8f0' }}>Install Conduit</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>Add to home screen for the full experience.</div>
      </div>
      <button onClick={triggerInstall} style={{
        padding: '7px 14px', borderRadius: 8, border: 'none',
        background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
        color: '#fff', fontWeight: 700, fontSize: 12,
        cursor: 'pointer', fontFamily: 'monospace', flexShrink: 0,
      }}>Install</button>
      <button onClick={dismiss} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', fontSize: 18, cursor: 'pointer', flexShrink: 0 }}>×</button>
    </div>
  )
}
