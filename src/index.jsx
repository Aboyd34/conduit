import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { Web3Provider } from './providers/Web3Provider.jsx';
import './index.css';

const root = createRoot(document.getElementById('root'));
root.render(
  <Web3Provider>
    <App />
  </Web3Provider>
);
