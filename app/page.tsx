'use client';

import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { SwapInterface } from '@/components/SwapInterface';
import { PoolInterface } from '@/components/PoolInterface';
import { LaunchInterface } from '@/components/LaunchInterface';
import { StatsPanel } from '@/components/StatsPanel';
import { BalancesPanel } from '@/components/BalancesPanel';
import { OpportunitiesPanel } from '@/components/OpportunitiesPanel';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'swap' | 'pool' | 'launch'>('swap');

  return (
    <main className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 animate-gradient bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            RedzExchange
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Advanced DeFi protocol built on Solana. Trade, provide liquidity, and launch tokens with lightning speed and minimal fees.
          </p>
          <div className="flex justify-center space-x-4 mb-8">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
              <div className="text-2xl font-bold text-green-400">$0.001</div>
              <div className="text-sm text-gray-400">Avg Fee</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
              <div className="text-2xl font-bold text-blue-400">~400ms</div>
              <div className="text-sm text-gray-400">Block Time</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
              <div className="text-2xl font-bold text-purple-400">24/7</div>
              <div className="text-sm text-gray-400">Uptime</div>
            </div>
          </div>
        </div>

        {/* Stats Panel */}
        <StatsPanel />

        {/* Balances & Top-up */}
        <div className="max-w-6xl mx-auto">
          <BalancesPanel />
        </div>

        {/* Opportunities */}
        <div className="max-w-6xl mx-auto">
          <OpportunitiesPanel onAddLiquidity={() => setActiveTab('pool')} />
        </div>

        {/* Main Interface */}
        <div className="max-w-6xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-2 border border-gray-700">
              <div className="flex space-x-2">
                {(['swap', 'pool', 'launch'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                      activeTab === tab
                        ? 'bg-primary-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-8">
            {activeTab === 'swap' && <SwapInterface />}
            {activeTab === 'pool' && <PoolInterface />}
            {activeTab === 'launch' && <LaunchInterface />}
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Why Choose RedzExchange?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Lightning Fast</h3>
              <p className="text-gray-400">Execute trades in milliseconds with Solana's high-performance blockchain</p>
            </div>
            
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Low Fees</h3>
              <p className="text-gray-400">Pay fraction of cents per transaction compared to Ethereum</p>
            </div>
            
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Secure</h3>
              <p className="text-gray-400">Audited smart contracts with battle-tested security practices</p>
            </div>
          </div>
        </div>

        {/* Opportunities Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Explore Opportunities
          </h2>
          <OpportunitiesPanel />
        </div>
      </div>
    </main>
  );
}