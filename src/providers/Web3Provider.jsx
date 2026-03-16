/**
 * Web3Provider — wraps app with wagmi + OnchainKit + TanStack Query
 * reconnectOnMount=false fixes React 19 setState-during-render warning
 * @farcaster/miniapp-sdk replaces deprecated frame-sdk
 */

import React from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { coinbaseWallet } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OnchainKitProvider } from '@coinbase/onchainkit';

const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    coinbaseWallet({
      appName: 'Conduit',
      preference: 'smartWalletOnly',
    }),
  ],
  transports: {
    [base.id]: http(),
  },
});

const queryClient = new QueryClient();

export function Web3Provider({ children }) {
  return (
    <WagmiProvider config={wagmiConfig} reconnectOnMount={false}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={import.meta.env.VITE_ONCHAINKIT_API_KEY}
          chain={base}
        >
          {children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default Web3Provider;
