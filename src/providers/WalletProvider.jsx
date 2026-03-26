/**
 * WalletProvider.jsx
 * Alchemy Account Kit + Gas Manager (gasless transactions for users)
 * Wraps root <App /> in main.jsx
 *
 * Gas Manager Policy ID: set VITE_GAS_POLICY_ID in .env
 * Get it: Alchemy Dashboard → Gas Manager → Create Policy → copy Policy ID
 */
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { coinbaseWallet, metaMask } from 'wagmi/connectors'

const queryClient = new QueryClient()

const ALCHEMY_KEY = import.meta.env.VITE_ALCHEMY_API_KEY || ''
const GAS_POLICY_ID = import.meta.env.VITE_GAS_POLICY_ID || ''
const RPC_URL = `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`

export const wagmiConfig = createConfig({
  chains: [sepolia],
  connectors: [
    metaMask(),
    coinbaseWallet({
      appName: 'Conduit',
      preference: 'smartWalletOnly',
      // Pass gas policy so Coinbase Smart Wallet sponsors gas automatically
      ...(GAS_POLICY_ID && {
        gasless: true,
        paymasterAndData: GAS_POLICY_ID,
      }),
    }),
  ],
  transports: {
    [sepolia.id]: http(RPC_URL),
  },
})

// Export config values for use in hooks
export { ALCHEMY_KEY, GAS_POLICY_ID, RPC_URL }

export function WalletProvider({ children }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
