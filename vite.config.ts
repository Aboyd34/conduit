import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

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
      'Content-Security-Policy':
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "connect-src 'self' ws://localhost:24678 ws://localhost:5173 ws://localhost:3000 http://localhost:3000; " +
        "img-src 'self' data:; " +
        "font-src 'self' data: https://fonts.gstatic.com",
    },
  },
  build: {
    outDir: 'dist',
  },
});
