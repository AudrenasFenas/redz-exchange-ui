'use client';

import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export function StatsPanel() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [stats, setStats] = useState({
    userBalance: 0,
    totalValueLocked: 1234567,
    volume24h: 567890,
    activeUsers: 1234,
  });

  useEffect(() => {
    if (publicKey && connection) {
      // Fetch user balance
      connection.getBalance(publicKey).then((balance) => {
        setStats(prev => ({
          ...prev,
          userBalance: balance / LAMPORTS_PER_SOL,
        }));
      });
    }
  }, [publicKey, connection]);

  const formatNumber = (num: number) => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toFixed(2);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <div className="text-2xl font-bold text-blue-400 mb-1">
          ${formatNumber(stats.totalValueLocked)}
        </div>
        <div className="text-sm text-gray-400">Total Value Locked</div>
      </div>
      
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <div className="text-2xl font-bold text-green-400 mb-1">
          ${formatNumber(stats.volume24h)}
        </div>
        <div className="text-sm text-gray-400">24h Volume</div>
      </div>
      
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <div className="text-2xl font-bold text-purple-400 mb-1">
          {formatNumber(stats.activeUsers)}
        </div>
        <div className="text-sm text-gray-400">Active Users</div>
      </div>
      
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <div className="text-2xl font-bold text-yellow-400 mb-1">
          {stats.userBalance.toFixed(4)} SOL
        </div>
        <div className="text-sm text-gray-400">Your Balance</div>
      </div>
    </div>
  );
}