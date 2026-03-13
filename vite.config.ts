import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "connect-src 'self' ws://localhost:24678 ws://localhost:5173 ws://localhost:3000 http://localhost:3000",
  "img-src 'self' data:",
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
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
