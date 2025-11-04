'use client';

import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { ArrowUpDown, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import { POPULAR_TOKENS } from '@/lib/constants';
import { usePrices } from '@/lib/prices';
import { useTokenList } from '@/lib/tokens';
import { createSwapInstruction, calculateSwapOutput, calculatePriceImpact } from '@/lib/instructions';

export function SwapInterface() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  
  const [fromToken, setFromToken] = useState(POPULAR_TOKENS[0]);
  const [toToken, setToToken] = useState(POPULAR_TOKENS[1]);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [isLoading, setIsLoading] = useState(false);
  const { prices } = usePrices([fromToken.mint, toToken.mint], 15000);
  const { getByMint } = useTokenList();

  // Mock pool data for demonstration
  const mockPoolData = {
    reserveA: 100000,
    reserveB: 50000,
    feeRate: 30, // 0.3%
  };

  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const calculateOutputAmount = (input: string) => {
    if (!input || isNaN(Number(input))) return '';
    
    const inputAmount = Number(input) * Math.pow(10, fromToken.decimals);
    const outputAmount = calculateSwapOutput(
      inputAmount,
      mockPoolData.reserveA,
      mockPoolData.reserveB,
      mockPoolData.feeRate
    );
    
    return (outputAmount / Math.pow(10, toToken.decimals)).toFixed(6);
  };

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    setToAmount(calculateOutputAmount(value));
  };

  const handleSwap = async () => {
    if (!publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!fromAmount || !toAmount) {
      toast.error('Please enter swap amounts');
      return;
    }

    setIsLoading(true);
    
    try {
      // Mock transaction for demonstration
      toast.success('Swap functionality will be implemented with real pool data');
      
      // In a real implementation, you would:
      // 1. Find or create associated token accounts
      // 2. Create swap instruction with real pool accounts
      // 3. Send transaction
      
    } catch (error) {
      console.error('Swap error:', error);
      toast.error('Swap failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const priceImpact = fromAmount ? calculatePriceImpact(
    Number(fromAmount) * Math.pow(10, fromToken.decimals),
    Number(toAmount) * Math.pow(10, toToken.decimals),
    mockPoolData.reserveA,
    mockPoolData.reserveB
  ) : 0;

  const fromPrice = prices[fromToken.mint];
  const toPrice = prices[toToken.mint];
  const rate = fromPrice && toPrice ? (fromPrice / toPrice) : undefined;

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Swap Tokens</h2>
        <button className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
          <Settings className="w-5 h-5 text-gray-300" />
        </button>
      </div>

      {/* From Token */}
      <div className="bg-gray-700/50 rounded-xl p-4 mb-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">From</span>
          <span className="text-sm text-gray-400">Balance: 0.0000</span>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="number"
            value={fromAmount}
            onChange={(e) => handleFromAmountChange(e.target.value)}
            placeholder="0.0"
            className="flex-1 bg-transparent text-2xl font-semibold text-white placeholder-gray-500 outline-none"
          />
          <div className="flex items-center space-x-2 bg-gray-600 rounded-lg px-3 py-2">
            {(() => {
              const t = getByMint(fromToken.mint);
              const src = t?.logoURI || fromToken.logoURI;
              return src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt={fromToken.symbol} className="w-6 h-6 rounded-full" />
              ) : (
                <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full" />
              );
            })()}
            <span className="font-semibold text-white">{fromToken.symbol}</span>
          </div>
        </div>
      </div>

      {/* Swap Button */}
      <div className="flex justify-center my-2">
        <button
          onClick={handleSwapTokens}
          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          <ArrowUpDown className="w-5 h-5 text-gray-300" />
        </button>
      </div>

      {/* To Token */}
      <div className="bg-gray-700/50 rounded-xl p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">To</span>
          <span className="text-sm text-gray-400">Balance: 0.0000</span>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="number"
            value={toAmount}
            readOnly
            placeholder="0.0"
            className="flex-1 bg-transparent text-2xl font-semibold text-white placeholder-gray-500 outline-none"
          />
          <div className="flex items-center space-x-2 bg-gray-600 rounded-lg px-3 py-2">
            {(() => {
              const t = getByMint(toToken.mint);
              const src = t?.logoURI || toToken.logoURI;
              return src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt={toToken.symbol} className="w-6 h-6 rounded-full" />
              ) : (
                <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full" />
              );
            })()}
            <span className="font-semibold text-white">{toToken.symbol}</span>
          </div>
        </div>
      </div>

      {/* Swap Details */}
      {fromAmount && toAmount && (
        <div className="bg-gray-700/30 rounded-lg p-3 mb-4 text-sm">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-400">Price Impact</span>
            <span className={`${priceImpact > 5 ? 'text-red-400' : priceImpact > 2 ? 'text-yellow-400' : 'text-green-400'}`}>
              {priceImpact.toFixed(2)}%
            </span>
          </div>
          {rate && (
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-400">Rate</span>
              <span className="text-gray-300">1 {fromToken.symbol} ≈ {rate.toFixed(6)} {toToken.symbol}</span>
            </div>
          )}
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-400">Fee</span>
            <span className="text-gray-300">0.3%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Min Received</span>
            <span className="text-gray-300">
              {(Number(toAmount) * (1 - slippage / 100)).toFixed(6)} {toToken.symbol}
            </span>
          </div>
        </div>
      )}

      {/* Swap Button */}
      <button
        onClick={handleSwap}
        disabled={!publicKey || !fromAmount || !toAmount || isLoading}
        className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors"
      >
        {!publicKey ? 'Connect Wallet' : isLoading ? 'Swapping...' : 'Swap'}
      </button>
    </div>
  );
}