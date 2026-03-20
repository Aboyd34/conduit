import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({ jsxRuntime: 'automatic' })
  ],
  server: {
    port: 5173,
    hmr: true,
    proxy: {
      '/api': 'http://localhost:3001',
      '/ws': { target: 'ws://localhost:3001', ws: true }
    }
  },
  optimizeDeps: {
    include: [
      'react', 'react-dom', 'react-router-dom',
      'wagmi', 'viem', '@tanstack/react-query', '@coinbase/onchainkit'
    ]
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor':   ['react', 'react-dom', 'react-router-dom'],
          'web3-vendor':    ['wagmi', 'viem', '@tanstack/react-query'],
          'onchain-vendor': ['@coinbase/onchainkit']
        }
      }
    }
  }
})
