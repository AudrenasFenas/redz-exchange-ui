"use client";

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { POPULAR_TOKENS } from '@/lib/constants';
import { useTokenBalances } from '@/lib/balances';
import { TopUpModal } from './TopUpModal';

function format(num?: number) {
  if (num === undefined) return '--';
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toFixed(2);
}

export function BalancesPanel() {
  const { connected } = useWallet();
  const { sol, solUsd, tokens } = useTokenBalances();
  const [topUpOpen, setTopUpOpen] = useState(false);

  return (
    <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 mb-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-lg font-semibold">Balances</h3>
        <button onClick={() => setTopUpOpen(true)} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold">Top up</button>
      </div>

      {!connected ? (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="text-gray-300">Connect your wallet to view balances and deposit options.</div>
          <WalletMultiButton className="!bg-gray-700 hover:!bg-gray-600 !rounded-lg !text-sm !font-semibold !px-4 !py-2 !h-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* SOL */}
          <div className="bg-gray-900/40 rounded-xl border border-gray-800 p-4">
            <div className="text-xs text-gray-400 mb-1">SOL</div>
            <div className="text-2xl font-bold text-yellow-400">{sol.toFixed(4)} SOL</div>
            <div className="text-sm text-gray-500">≈ ${format(solUsd)}</div>
          </div>
          {/* Popular tokens */}
          {tokens.map((t) => (
            <div key={t.mint} className="bg-gray-900/40 rounded-xl border border-gray-800 p-4">
              <div className="text-xs text-gray-400 mb-1">{t.symbol}</div>
              <div className="text-2xl font-bold text-white">{t.amount.toFixed(4)} {t.symbol}</div>
              <div className="text-sm text-gray-500">{t.usd !== undefined ? `≈ $${format(t.usd)}` : '—'}</div>
            </div>
          ))}
        </div>
      )}

      <TopUpModal open={topUpOpen} onClose={() => setTopUpOpen(false)} />
    </div>
  );
}
