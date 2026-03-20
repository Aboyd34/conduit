import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// Lazy-wrap Web3Provider so a wallet error never white-screens the app
function SafeWeb3({ children }) {
  const [Provider, setProvider] = React.useState(null)
  const [failed, setFailed] = React.useState(false)

  React.useEffect(() => {
    import('./providers/Web3Provider.jsx')
      .then(m => setProvider(() => m.Web3Provider))
      .catch(() => setFailed(true))
  }, [])

  if (failed || !Provider) return <>{children}</>
  return <Provider>{children}</Provider>
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <SafeWeb3>
        <App />
      </SafeWeb3>
    </BrowserRouter>
  </React.StrictMode>
)
