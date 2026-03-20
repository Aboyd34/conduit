import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './index.css'

function SafeWeb3({ children }) {
  const [Provider, setProvider] = React.useState(null)
  const [failed, setFailed] = React.useState(false)

  React.useEffect(() => {
    import('./providers/Web3Provider.jsx')
      .then(m => setProvider(() => m.Web3Provider))
      .catch(() => setFailed(true))
  }, [])

  // Web3 failed or not loaded yet — render children directly (app still works)
  if (!Provider || failed) return <>{children}</>
  return <Provider>{children}</Provider>
}

ReactDOM.createRoot(document.getElementById('root')).render(
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
