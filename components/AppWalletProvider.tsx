'use client';

import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { RPC_URL, NETWORK } from '@/lib/constants';

export function AppWalletProvider({ children }: { children: React.ReactNode }) {
  // Use environment-based network configuration
  const network = NETWORK === 'mainnet' ? WalletAdapterNetwork.Mainnet : WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => {
    // Use custom RPC URL if provided, otherwise use default cluster URL
    return RPC_URL !== clusterApiUrl(network) ? RPC_URL : clusterApiUrl(network);
  }, [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}