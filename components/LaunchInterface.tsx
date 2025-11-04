'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Rocket, Clock, TrendingUp, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export function LaunchInterface() {
  const { publicKey } = useWallet();
  const [activeTab, setActiveTab] = useState<'participate' | 'create'>('participate');
  
  // Create Launch State
  const [tokenMint, setTokenMint] = useState('');
  const [tokenAmount, setTokenAmount] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [duration, setDuration] = useState('86400'); // 1 day in seconds
  
  // Participate State
  const [participateAmount, setParticipateAmount] = useState('');

  // Mock launch data
  const mockLaunches = [
    {
      id: 1,
      tokenSymbol: 'REDZ',
      tokenName: 'RedzToken',
      targetAmount: 100,
      currentAmount: 75.5,
      tokenAmount: 1000000,
      timeLeft: 86400, // 1 day
      participants: 234,
      status: 'active',
    },
    {
      id: 2,
      tokenSymbol: 'MOON',
      tokenName: 'MoonToken',
      targetAmount: 50,
      currentAmount: 50,
      tokenAmount: 500000,
      timeLeft: 0,
      participants: 156,
      status: 'completed',
    },
    {
      id: 3,
      tokenSymbol: 'STAR',
      tokenName: 'StarToken',
      targetAmount: 200,
      currentAmount: 23.8,
      tokenAmount: 2000000,
      timeLeft: 259200, // 3 days
      participants: 89,
      status: 'active',
    },
  ];

  const handleCreateLaunch = async () => {
    if (!publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!tokenMint || !tokenAmount || !targetAmount) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      toast.success('Token launch functionality will be implemented');
      // Implementation would create launch instruction
    } catch (error) {
      toast.error('Failed to create launch');
    }
  };

  const handleParticipate = async (launchId: number) => {
    if (!publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!participateAmount) {
      toast.error('Please enter participation amount');
      return;
    }

    try {
      toast.success(`Participated in launch ${launchId} with ${participateAmount} SOL`);
      // Implementation would create participate instruction
    } catch (error) {
      toast.error('Failed to participate in launch');
    }
  };

  const formatTimeLeft = (seconds: number) => {
    if (seconds <= 0) return 'Ended';
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-700/50 rounded-xl p-1">
          <div className="flex space-x-1">
            {(['participate', 'create'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab === 'participate' && <Users className="w-4 h-4 inline mr-2" />}
                {tab === 'create' && <Rocket className="w-4 h-4 inline mr-2" />}
                {tab === 'participate' ? 'Join Launch' : 'Create Launch'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === 'participate' && (
        <div>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Token Launches</h2>
            <p className="text-gray-400">Participate in new token launches and get early access</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockLaunches.map((launch) => (
              <div key={launch.id} className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                {/* Launch Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">{launch.tokenSymbol[0]}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{launch.tokenSymbol}</h3>
                        <p className="text-sm text-gray-400">{launch.tokenName}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      launch.status === 'active' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {launch.status}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">Progress</span>
                      <span className="text-sm text-white font-semibold">
                        {launch.currentAmount}/{launch.targetAmount} SOL
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage(launch.currentAmount, launch.targetAmount)}%` }}
                      ></div>
                    </div>
                    <div className="text-center mt-1">
                      <span className="text-xs text-gray-400">
                        {getProgressPercentage(launch.currentAmount, launch.targetAmount).toFixed(1)}% Complete
                      </span>
                    </div>
                  </div>

                  {/* Launch Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-700/30 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Clock className="w-4 h-4 text-orange-400" />
                        <span className="text-xs text-gray-400">Time Left</span>
                      </div>
                      <div className="text-sm font-semibold text-white">
                        {formatTimeLeft(launch.timeLeft)}
                      </div>
                    </div>
                    <div className="bg-gray-700/30 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span className="text-xs text-gray-400">Participants</span>
                      </div>
                      <div className="text-sm font-semibold text-white">{launch.participants}</div>
                    </div>
                  </div>

                  {/* Token Amount */}
                  <div className="bg-gray-700/30 rounded-lg p-3 mb-4">
                    <div className="flex items-center space-x-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span className="text-xs text-gray-400">Token Amount</span>
                    </div>
                    <div className="text-sm font-semibold text-white">
                      {launch.tokenAmount.toLocaleString()} {launch.tokenSymbol}
                    </div>
                  </div>
                </div>

                {/* Participate Section */}
                {launch.status === 'active' && (
                  <div className="p-6 pt-0">
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        value={participateAmount}
                        onChange={(e) => setParticipateAmount(e.target.value)}
                        placeholder="SOL amount"
                        className="flex-1 bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 outline-none focus:border-primary-500"
                      />
                      <button
                        onClick={() => handleParticipate(launch.id)}
                        disabled={!publicKey}
                        className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                      >
                        Join
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'create' && (
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Create Token Launch</h2>
            <p className="text-gray-400">Launch your token and raise funds from the community</p>
          </div>

          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Token Mint Address *
                </label>
                <input
                  type="text"
                  value={tokenMint}
                  onChange={(e) => setTokenMint(e.target.value)}
                  placeholder="Enter your token mint address"
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-primary-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Token Amount *
                  </label>
                  <input
                    type="number"
                    value={tokenAmount}
                    onChange={(e) => setTokenAmount(e.target.value)}
                    placeholder="1000000"
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-primary-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Number of tokens to launch</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Target Amount (SOL) *
                  </label>
                  <input
                    type="number"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="100"
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-primary-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">SOL amount to raise</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Launch Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white outline-none focus:border-primary-500"
                >
                  <option value="86400">1 Day</option>
                  <option value="259200">3 Days</option>
                  <option value="604800">1 Week</option>
                  <option value="1209600">2 Weeks</option>
                  <option value="2419200">1 Month</option>
                </select>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-black font-bold">!</span>
                  </div>
                  <div>
                    <p className="text-sm text-yellow-200 font-medium mb-1">Launch Fee Required</p>
                    <p className="text-xs text-yellow-300/80">
                      A small fee of 0.001 SOL is required to create a token launch. This helps prevent spam and supports platform development.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCreateLaunch}
                disabled={!publicKey}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center space-x-2"
              >
                <Rocket className="w-5 h-5" />
                <span>{!publicKey ? 'Connect Wallet' : 'Create Launch'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}