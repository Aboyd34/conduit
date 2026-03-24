import React from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { coinbaseWallet } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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

const apiKey = import.meta.env.VITE_ONCHAINKIT_API_KEY;
const hasRealKey = apiKey && apiKey !== 'placeholder' && apiKey.length > 10;

function MaybeOnchainKit({ children }) {
  if (!hasRealKey) return <>{children}</>;
  // Lazy-load OnchainKitProvider only when a real key is present
  const { OnchainKitProvider } = require('@coinbase/onchainkit');
  return (
    <OnchainKitProvider apiKey={apiKey} chain={base}>
      {children}
    </OnchainKitProvider>
  );
}

export function Web3Provider({ children }) {
  return (
    <WagmiProvider config={wagmiConfig} reconnectOnMount={false}>
      <QueryClientProvider client={queryClient}>
        <MaybeOnchainKit>
          {children}
        </MaybeOnchainKit>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default Web3Provider;
