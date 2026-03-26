/**
 * Register Conduit service worker for PWA support
 * Import this in main.jsx
 */
export function registerSW() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('[Conduit SW] registered', reg.scope))
        .catch(err => console.warn('[Conduit SW] registration failed', err))
    })
  }
}

// PWA install prompt
let deferredPrompt = null
export function setupInstallPrompt(onReady) {
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault()
    deferredPrompt = e
    if (onReady) onReady()
  })
}
export function triggerInstall() {
  if (deferredPrompt) {
    deferredPrompt.prompt()
    deferredPrompt.userChoice.then(() => { deferredPrompt = null })
  }
}
