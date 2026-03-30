/**
 * WalletProvider.jsx
 * Wagmi + OnchainKit on Base Sepolia
 * CDT contract: 0x719d3f3E01E365F9aa73374674499539fdD0f82E
 */
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { coinbaseWallet, metaMask } from 'wagmi/connectors'

const queryClient = new QueryClient()

const ONCHAINKIT_API_KEY = import.meta.env.VITE_ONCHAINKIT_API_KEY || ''
const ALCHEMY_KEY = import.meta.env.VITE_ALCHEMY_API_KEY || ''

const RPC_URL = ALCHEMY_KEY
  ? `https://base-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`
  : undefined

export const wagmiConfig = createConfig({
  chains: [baseSepolia],
  connectors: [
    metaMask(),
    coinbaseWallet({
      appName: 'Conduit',
      preference: 'smartWalletOnly',
    }),
  ],
  transports: {
    [baseSepolia.id]: RPC_URL ? http(RPC_URL) : http(),
  },
})

export { ONCHAINKIT_API_KEY, ALCHEMY_KEY, RPC_URL }

export function WalletProvider({ children }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
