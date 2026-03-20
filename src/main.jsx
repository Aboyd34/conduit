import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Web3Provider } from './providers/Web3Provider.jsx'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Web3Provider>
        <App />
      </Web3Provider>
    </BrowserRouter>
  </React.StrictMode>
)
