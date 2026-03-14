import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.coinbase.com https://*.walletconnect.com https://*.walletconnect.org",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' ws://localhost:24678 ws://localhost:5173 ws://localhost:3000 http://localhost:3000 https://*.coinbase.com https://api.developer.coinbase.com https://*.walletconnect.com https://*.walletconnect.org wss://*.walletconnect.com wss://*.walletconnect.org https://rpc.walletconnect.com https://base-mainnet.g.alchemy.com https://mainnet.base.org",
  "img-src 'self' data: https://*.coinbase.com https://ipfs.io https://*.ipfs.io",
  "frame-src 'self' https://*.coinbase.com https://keys.coinbase.com",
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
    headers: {
      'Content-Security-Policy': CSP,
    },
  },
  build: {
    outDir: 'dist',
  },
});
