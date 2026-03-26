/**
 * WalletProvider.jsx
 * Wraps the app with Alchemy Account Kit + wagmi + react-query
 * Drop this around your root <App /> in main.jsx
 */
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { coinbaseWallet, metaMask } from 'wagmi/connectors'

const queryClient = new QueryClient()

const wagmiConfig = createConfig({
  chains: [sepolia],
  connectors: [
    metaMask(),
    coinbaseWallet({
      appName: 'Conduit',
      // Smart wallet mode — users get a smart wallet automatically
      preference: 'smartWalletOnly',
    }),
  ],
  transports: {
    [sepolia.id]: http(
      import.meta.env.VITE_SEPOLIA_RPC_URL ||
      `https://eth-sepolia.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`
    ),
  },
})

export function WalletProvider({ children }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
