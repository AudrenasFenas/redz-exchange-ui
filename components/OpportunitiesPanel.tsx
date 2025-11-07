"use client";

interface Opportunity {
  id: string;
  tokenA: string;
  tokenB: string;
  tvl: number;
  apy: number;
  volume24h: number;
}

const mockOpportunities: Opportunity[] = [
  {
    id: 'sol-usdc',
    tokenA: 'SOL',
    tokenB: 'USDC',
    tvl: 1250000,
    apy: 12.5,
    volume24h: 450000,
  },
  {
    id: 'sol-usdt',
    tokenA: 'SOL',
    tokenB: 'USDT',
    tvl: 890000,
    apy: 11.2,
    volume24h: 320000,
  },
  {
    id: 'usdc-usdt',
    tokenA: 'USDC',
    tokenB: 'USDT',
    tvl: 2100000,
    apy: 8.7,
    volume24h: 780000,
  },
];

function format(num: number) {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toFixed(2);
}

interface OpportunitiesPanelProps {
  onAddLiquidity?: () => void;
}

export function OpportunitiesPanel({ onAddLiquidity }: OpportunitiesPanelProps = {}) {
  return (
    <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 mb-10">
      <h3 className="text-white text-lg font-semibold mb-4">Investment Opportunities</h3>
      <div className="space-y-4">
        {mockOpportunities.map((opp) => (
          <div key={opp.id} className="bg-gray-900/40 rounded-xl border border-gray-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-white font-semibold">
                {opp.tokenA}/{opp.tokenB}
              </div>
              <div className="text-green-400 font-bold">
                {opp.apy.toFixed(1)}% APY
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-400">TVL</div>
                <div className="text-white">${format(opp.tvl)}</div>
              </div>
              <div>
                <div className="text-gray-400">24h Volume</div>
                <div className="text-white">${format(opp.volume24h)}</div>
              </div>
            </div>
            <button 
              onClick={onAddLiquidity}
              className="w-full mt-4 bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg text-sm font-semibold"
            >
              Add Liquidity
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}