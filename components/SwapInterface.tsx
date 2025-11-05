'use client';

import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { ArrowUpDown, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import { POPULAR_TOKENS } from '@/lib/constants';
import { usePrices } from '@/lib/prices';
import { useTokenList } from '@/lib/tokens';
import { requireWallet, validateFields } from '@/lib/wallet-utils';
import { TokenSelector } from './TokenSelector';
import { Button, TokenInput } from './ui';
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
  const [selecting, setSelecting] = useState<null | 'from' | 'to'>(null);
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
    if (!requireWallet(publicKey)) {
      return;
    }

    if (!validateFields({ fromAmount, toAmount }, 'Please enter swap amounts')) {
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
  const fromUsd = fromPrice && fromAmount ? (Number(fromAmount) * fromPrice) : undefined;
  const toUsd = toPrice && toAmount ? (Number(toAmount) * toPrice) : undefined;

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Swap Tokens</h2>
        <button className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
          <Settings className="w-5 h-5 text-gray-300" />
        </button>
      </div>

      {/* From Token */}
      <TokenInput
        label="From"
        token={fromToken}
        amount={fromAmount}
        onAmountChange={handleFromAmountChange}
        onTokenClick={() => setSelecting('from')}
        logoURI={getByMint(fromToken.mint)?.logoURI}
        usdValue={fromUsd !== undefined && !isNaN(fromUsd) ? fromUsd.toFixed(2) : undefined}
      />

      {/* Swap Button */}
      <div className="flex justify-center my-2">
        <Button
          variant="secondary"
          onClick={handleSwapTokens}
          className="!p-2 !rounded-lg"
        >
          <ArrowUpDown className="w-5 h-5 text-gray-300" />
        </Button>
      </div>

      {/* To Token */}
      <TokenInput
        label="To"
        token={toToken}
        amount={toAmount}
        onTokenClick={() => setSelecting('to')}
        logoURI={getByMint(toToken.mint)?.logoURI}
        readOnly
        usdValue={toUsd !== undefined && !isNaN(toUsd) ? toUsd.toFixed(2) : undefined}
      />

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
      <Button
        onClick={handleSwap}
        disabled={!publicKey || !fromAmount || !toAmount || isLoading}
        fullWidth
        size="lg"
      >
        {!publicKey ? 'Connect Wallet' : isLoading ? 'Swapping...' : 'Swap'}
      </Button>

      {/* Token selectors */}
      <TokenSelector
        open={selecting === 'from'}
        onClose={() => setSelecting(null)}
        onSelect={(t) => {
          setFromToken({ ...fromToken, ...t });
          setSelecting(null);
          if (fromAmount) setToAmount(calculateOutputAmount(fromAmount));
        }}
      />
      <TokenSelector
        open={selecting === 'to'}
        onClose={() => setSelecting(null)}
        onSelect={(t) => {
          setToToken({ ...toToken, ...t });
          setSelecting(null);
          if (fromAmount) setToAmount(calculateOutputAmount(fromAmount));
        }}
      />
    </div>
  );
}