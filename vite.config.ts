import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// lqipPlugin only runs at build time — never in dev (causes 8s startup)
const isProd = process.env.NODE_ENV === 'production'

export default defineConfig(async () => {
  const plugins = [react()]
  if (isProd) {
    const { default: lqipPlugin } = await import('./vite.lqip')
    plugins.push(lqipPlugin())
  }

  return {
    plugins,
    server: {
      port: 5173,
      hmr: true,
      proxy: {
        '/api': 'http://localhost:3000',
        '/socket.io': { target: 'http://localhost:3000', ws: true }
      }
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'wagmi',
        'viem',
        '@tanstack/react-query',
        '@coinbase/onchainkit'
      ],
      force: false
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor':  ['react', 'react-dom', 'react-router-dom'],
            'web3-vendor':   ['wagmi', 'viem', '@tanstack/react-query'],
            'onchain-vendor': ['@coinbase/onchainkit']
          }
        }
      }
    }
  }
})
