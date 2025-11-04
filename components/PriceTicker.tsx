"use client";

import { useMemo } from 'react';
import { POPULAR_TOKENS } from '@/lib/constants';
import { usePrices } from '@/lib/prices';

export function PriceTicker() {
  const mints = useMemo(() => POPULAR_TOKENS.map(t => t.mint), []);
  const { prices } = usePrices(mints, 15000);

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-center gap-6 py-2 text-sm">
        {POPULAR_TOKENS.map((t) => {
          const p = prices[t.mint];
          return (
            <div key={t.mint} className="flex items-center gap-2 whitespace-nowrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {t.logoURI ? <img src={t.logoURI} alt={t.symbol} className="w-4 h-4 rounded-full" /> : <div className="w-4 h-4 rounded-full bg-gray-700" />}
              <span className="text-gray-300 font-medium">{t.symbol}</span>
              <span className="text-gray-400">{p ? `$${p.toFixed(3)}` : '$--'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
