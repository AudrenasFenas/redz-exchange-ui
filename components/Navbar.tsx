'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { APP_CONFIG } from '@/lib/constants';

export function Navbar() {
  const { connected, publicKey } = useWallet();

  return (
    <nav className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">R</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{APP_CONFIG.name}</h1>
              <p className="text-xs text-gray-400">v{APP_CONFIG.version}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#swap" className="text-gray-300 hover:text-white transition-colors">
              Swap
            </a>
            <a href="#pools" className="text-gray-300 hover:text-white transition-colors">
              Pools
            </a>
            <a href="#launch" className="text-gray-300 hover:text-white transition-colors">
              Launch
            </a>
            <a href="#analytics" className="text-gray-300 hover:text-white transition-colors">
              Analytics
            </a>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {connected && publicKey && (
              <div className="hidden md:block text-sm text-gray-400">
                {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
              </div>
            )}
            <WalletMultiButton className="!bg-primary-600 hover:!bg-primary-700 !rounded-lg !text-sm !font-semibold !px-4 !py-2 !h-auto" />
          </div>
        </div>
      </div>
    </nav>
  );
}