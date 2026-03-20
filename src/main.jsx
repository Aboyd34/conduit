import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

function SafeWeb3({ children }) {
  const [Provider, setProvider] = React.useState(null)

  React.useEffect(() => {
    import('./providers/Web3Provider.jsx')
      .then(m => setProvider(() => m.Web3Provider))
      .catch(() => {})
  }, [])

  if (!Provider) return <>{children}</>
  return <Provider>{children}</Provider>
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <SafeWeb3>
        <App />
      </SafeWeb3>
    </BrowserRouter>
  </React.StrictMode>
)
