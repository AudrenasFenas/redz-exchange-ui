'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Plus, Minus, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { POPULAR_TOKENS } from '@/lib/constants';

export function PoolInterface() {
  const { publicKey } = useWallet();
  const [activeTab, setActiveTab] = useState<'add' | 'remove' | 'create'>('add');
  
  // Add Liquidity State
  const [tokenA, setTokenA] = useState(POPULAR_TOKENS[0]);
  const [tokenB, setTokenB] = useState(POPULAR_TOKENS[1]);
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');
  
  // Create Pool State
  const [newTokenA, setNewTokenA] = useState('');
  const [newTokenB, setNewTokenB] = useState('');
  const [initialAmountA, setInitialAmountA] = useState('');
  const [initialAmountB, setInitialAmountB] = useState('');
  const [feeRate, setFeeRate] = useState(30); // 0.3%

  // Mock pool data
  const mockPools = [
    {
      tokenA: 'SOL',
      tokenB: 'USDC',
      tvl: 1234567,
      volume24h: 234567,
      apr: 15.6,
      userLiquidity: 1234.56,
    },
    {
      tokenA: 'SOL',
      tokenB: 'USDT',
      tvl: 567890,
      volume24h: 123456,
      apr: 12.3,
      userLiquidity: 0,
    },
  ];

  const handleAddLiquidity = async () => {
    if (!publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!amountA || !amountB) {
      toast.error('Please enter both token amounts');
      return;
    }

    try {
      toast.success('Add liquidity functionality will be implemented with real pool data');
      // Implementation would create add liquidity instruction
    } catch (error) {
      toast.error('Failed to add liquidity');
    }
  };

  const handleCreatePool = async () => {
    if (!publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!newTokenA || !newTokenB || !initialAmountA || !initialAmountB) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      toast.success('Create pool functionality will be implemented');
      // Implementation would create pool instruction
    } catch (error) {
      toast.error('Failed to create pool');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-700/50 rounded-xl p-1">
          <div className="flex space-x-1">
            {(['add', 'remove', 'create'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab === 'add' && <Plus className="w-4 h-4 inline mr-1" />}
                {tab === 'remove' && <Minus className="w-4 h-4 inline mr-1" />}
                {tab === 'create' && <TrendingUp className="w-4 h-4 inline mr-1" />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)} {tab !== 'create' && 'Liquidity'}
                {tab === 'create' && ' Pool'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Main Interface */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          {activeTab === 'add' && (
            <div>
              <h3 className="text-xl font-bold text-white mb-6">Add Liquidity</h3>
              
              {/* Token A Input */}
              <div className="bg-gray-700/50 rounded-xl p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Token A</span>
                  <span className="text-sm text-gray-400">Balance: 0.0000</span>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    value={amountA}
                    onChange={(e) => setAmountA(e.target.value)}
                    placeholder="0.0"
                    className="flex-1 bg-transparent text-xl font-semibold text-white placeholder-gray-500 outline-none"
                  />
                  <div className="flex items-center space-x-2 bg-gray-600 rounded-lg px-3 py-2">
                    <div className="w-5 h-5 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
                    <span className="font-semibold text-white">{tokenA.symbol}</span>
                  </div>
                </div>
              </div>

              {/* Token B Input */}
              <div className="bg-gray-700/50 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Token B</span>
                  <span className="text-sm text-gray-400">Balance: 0.0000</span>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    value={amountB}
                    onChange={(e) => setAmountB(e.target.value)}
                    placeholder="0.0"
                    className="flex-1 bg-transparent text-xl font-semibold text-white placeholder-gray-500 outline-none"
                  />
                  <div className="flex items-center space-x-2 bg-gray-600 rounded-lg px-3 py-2">
                    <div className="w-5 h-5 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"></div>
                    <span className="font-semibold text-white">{tokenB.symbol}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleAddLiquidity}
                disabled={!publicKey}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                {!publicKey ? 'Connect Wallet' : 'Add Liquidity'}
              </button>
            </div>
          )}

          {activeTab === 'create' && (
            <div>
              <h3 className="text-xl font-bold text-white mb-6">Create New Pool</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Token A Mint Address</label>
                  <input
                    type="text"
                    value={newTokenA}
                    onChange={(e) => setNewTokenA(e.target.value)}
                    placeholder="Enter token mint address..."
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 outline-none focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Token B Mint Address</label>
                  <input
                    type="text"
                    value={newTokenB}
                    onChange={(e) => setNewTokenB(e.target.value)}
                    placeholder="Enter token mint address..."
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 outline-none focus:border-primary-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Initial Amount A</label>
                    <input
                      type="number"
                      value={initialAmountA}
                      onChange={(e) => setInitialAmountA(e.target.value)}
                      placeholder="0.0"
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Initial Amount B</label>
                    <input
                      type="number"
                      value={initialAmountB}
                      onChange={(e) => setInitialAmountB(e.target.value)}
                      placeholder="0.0"
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 outline-none focus:border-primary-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Fee Rate (basis points)</label>
                  <select
                    value={feeRate}
                    onChange={(e) => setFeeRate(Number(e.target.value))}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white outline-none focus:border-primary-500"
                  >
                    <option value={10}>0.01% (10 bp)</option>
                    <option value={30}>0.3% (30 bp)</option>
                    <option value={100}>1% (100 bp)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleCreatePool}
                disabled={!publicKey}
                className="w-full mt-6 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                {!publicKey ? 'Connect Wallet' : 'Create Pool'}
              </button>
            </div>
          )}
        </div>

        {/* Pool List */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-6">Active Pools</h3>
          
          <div className="space-y-4">
            {mockPools.map((pool, index) => (
              <div key={index} className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full border-2 border-gray-800"></div>
                      <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full border-2 border-gray-800"></div>
                    </div>
                    <span className="font-semibold text-white">{pool.tokenA}/{pool.tokenB}</span>
                  </div>
                  <span className="text-green-400 font-semibold">{pool.apr}% APR</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">TVL</div>
                    <div className="text-white font-semibold">${pool.tvl.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">24h Volume</div>
                    <div className="text-white font-semibold">${pool.volume24h.toLocaleString()}</div>
                  </div>
                </div>
                
                {pool.userLiquidity > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <div className="text-sm text-gray-400">Your Liquidity</div>
                    <div className="text-white font-semibold">${pool.userLiquidity.toFixed(2)}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}