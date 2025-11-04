"use client";

import { useMemo, useState } from 'react';
import { useTokenList } from '@/lib/tokens';
import type { TokenInfo } from '@/lib/constants';

interface TokenSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (token: TokenInfo) => void;
}

export function TokenSelector({ open, onClose, onSelect }: TokenSelectorProps) {
  const { tokenMap, loading } = useTokenList();
  const [query, setQuery] = useState('');

  const items: TokenInfo[] = useMemo(() => {
    if (!tokenMap) return [];
    const q = query.trim().toLowerCase();
    const arr = Array.from(tokenMap.values());
    if (!q) return arr.slice(0, 300); // limit
    return arr.filter((t) =>
      t.symbol?.toLowerCase().includes(q) ||
      t.name?.toLowerCase().includes(q) ||
      t.mint?.toLowerCase().includes(q)
    ).slice(0, 300);
  }, [tokenMap, query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-800 rounded-xl w-full max-w-lg mx-4 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold">Select a token</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by symbol, name, or mint"
          className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-lg px-3 py-2 mb-3 outline-none focus:border-primary-500"
        />
        {loading ? (
          <div className="text-gray-400 text-sm">Loading token list…</div>
        ) : (
          <div className="max-h-96 overflow-auto divide-y divide-gray-800">
            {items.map((t) => (
              <button
                key={t.mint}
                onClick={() => onSelect(t)}
                className="w-full flex items-center gap-3 px-2 py-2 hover:bg-gray-800 text-left"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {t.logoURI ? <img src={t.logoURI} alt={t.symbol} className="w-6 h-6 rounded-full" /> : <div className="w-6 h-6 rounded-full bg-gray-700" />}
                <div className="flex-1">
                  <div className="text-white text-sm font-medium">{t.symbol} <span className="text-gray-400 font-normal">· {t.name}</span></div>
                  <div className="text-xs text-gray-500">{t.mint}</div>
                </div>
              </button>
            ))}
            {items.length === 0 && (
              <div className="text-gray-400 text-sm p-3">No results</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
