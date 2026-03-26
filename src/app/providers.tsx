'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@mysten/dapp-kit/dist/index.css';
import { ReactNode } from 'react';

const queryClient = new QueryClient();

const networks = {
  mainnet: {
    url: 'https://fullnode.mainnet.sui.io:443',
    network: 'mainnet' as const,
  },
};

export function Providers({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider
      appId="cmn7yq7ik02oc0cjgzhpg7xtd"
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#ef4444',
        },
        loginMethods: ['email', 'google', 'wallet'],
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <SuiClientProvider networks={networks} defaultNetwork="mainnet">
          <WalletProvider autoConnect>
            {children}
          </WalletProvider>
        </SuiClientProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}