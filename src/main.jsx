import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './index.css'

// Crash-safe Web3 loader — never blocks render
function SafeWeb3({ children }) {
  const [Provider, setProvider] = React.useState(null)

  React.useEffect(() => {
    let cancelled = false
    import('./providers/Web3Provider.jsx')
      .then(m => { if (!cancelled) setProvider(() => m.Web3Provider) })
      .catch(() => {}) // Web3 optional — app works without it
    return () => { cancelled = true }
  }, [])

  if (!Provider) return <>{children}</>
  return <Provider>{children}</Provider>
}

const root = document.getElementById('root')
if (!root) throw new Error('Missing #root element in index.html')

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <SafeWeb3>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </SafeWeb3>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
)
