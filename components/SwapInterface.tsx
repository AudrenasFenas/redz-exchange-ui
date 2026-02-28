'use client';

import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccountInstructions, createTokenTransferInstruction } from '@/lib/token';
import { getPoolReserves, estimateTransactionFee } from '@/lib/chain';
import { ArrowUpDown, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import { POPULAR_TOKENS } from '@/lib/constants';
import { usePrices } from '@/lib/prices';
import { useTokenList } from '@/lib/tokens';
import { TokenSelector } from './TokenSelector';
import { createSwapInstruction, calculateSwapOutput, calculatePriceImpact } from '@/lib/instructions';
import ProgrammaticWalletModal from './ProgrammaticWalletModal';
import ConfirmTransactionModal from './ConfirmTransactionModal';

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
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [poolAddress, setPoolAddress] = useState('');
  const [userTokenAAccount, setUserTokenAAccount] = useState('');
  const [userTokenBAccount, setUserTokenBAccount] = useState('');
  const [tokenAVault, setTokenAVault] = useState('');
  const [tokenBVault, setTokenBVault] = useState('');
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [pendingTx, setPendingTx] = useState<Transaction | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [summaryItems, setSummaryItems] = useState<{ label: string; value: string }[]>([]);

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
      // If advanced pool/account info is provided, attempt a real swap
      if (poolAddress && userTokenAAccount && userTokenBAccount) {
        // Require vault addresses too for an on-chain swap
        if (!tokenAVault || !tokenBVault) {
          toast.error('Please provide pool token vault addresses to execute an on-chain swap (Advanced)');
        } else {
          try {
            const poolPub = new PublicKey(poolAddress);
            const userAPub = new PublicKey(userTokenAAccount);
            const userBPub = new PublicKey(userTokenBAccount);
            const tokenAVaultPub = new PublicKey(tokenAVault);
            const tokenBVaultPub = new PublicKey(tokenBVault);

            // Convert amounts to raw units
            const amountIn = Math.floor(Number(fromAmount) * Math.pow(10, fromToken.decimals));

            // Estimate amount out using mock pool data (best-effort). In production, fetch pool reserves.
            const estimatedOut = calculateSwapOutput(
              amountIn,
              mockPoolData.reserveA,
              mockPoolData.reserveB,
              mockPoolData.feeRate
            );
            const minOut = Math.floor(estimatedOut * (1 - slippage / 100));

            // Prepare user's ATAs for the two tokens
            const mintAPub = new PublicKey(fromToken.mint);
            const mintBPub = new PublicKey(toToken.mint);

            const ataARes = await getOrCreateAssociatedTokenAccountInstructions(connection, publicKey as PublicKey, publicKey as PublicKey, mintAPub);
            const ataBRes = await getOrCreateAssociatedTokenAccountInstructions(connection, publicKey as PublicKey, publicKey as PublicKey, mintBPub);

            const userATAA = ataARes.ata;
            const userATAB = ataBRes.ata;

            // Transfer user's token A to the pool's token A vault
            const transferToVault = createTokenTransferInstruction(userATAA, tokenAVaultPub, publicKey as PublicKey, mintAPub, amountIn, fromToken.decimals);

            // Build swap instruction
            const swapIx = createSwapInstruction(
              publicKey as PublicKey,
              poolPub,
              userATAA,
              userATAB,
              tokenAVaultPub,
              tokenBVaultPub,
              amountIn,
              minOut
            );

            const tx = new Transaction();
            ataARes.instructions.forEach((i: any) => tx.add(i));
            ataBRes.instructions.forEach((i: any) => tx.add(i));
            tx.add(transferToVault);
            tx.add(swapIx);

            // Fetch reserves and estimate fee
            const tokenAVaultPubProvided = tokenAVault ? new PublicKey(tokenAVault) : undefined;
            const tokenBVaultPubProvided = tokenBVault ? new PublicKey(tokenBVault) : undefined;
            const reserves = await getPoolReserves(connection, poolPub, tokenAVaultPubProvided, tokenBVaultPubProvided).catch(() => null);
            const feeEstimate = await estimateTransactionFee(connection, tx, publicKey as PublicKey).catch(() => null);

            const items: { label: string; value: string }[] = [
              { label: 'Pool', value: poolAddress },
              { label: 'Amount In', value: `${fromToken.symbol} ${Number(fromAmount).toFixed(6)}` },
              { label: 'Min Out', value: `${toToken.symbol} ${(minOut / Math.pow(10, toToken.decimals)).toFixed(6)}` },
            ];
            if (reserves) {
              items.push({ label: 'Reserve A', value: reserves.tokenAReserve.toString() });
              items.push({ label: 'Reserve B', value: reserves.tokenBReserve.toString() });
            }
            if (feeEstimate !== null) items.push({ label: 'Estimated Fee (lamports)', value: feeEstimate.toString() });

            setSummaryItems(items);
            setPendingTx(tx);
            setConfirmOpen(true);
          } catch (err) {
            console.error('Swap advanced error', err);
            toast.error('Failed to build advanced swap transaction');
          }
        }
      } else {
        // Demo fallback
        toast.success('Swap (demo) — provide pool and account addresses in Advanced section to execute a real transaction');
      }
    } catch (error) {
      console.error('Swap error:', error);
      toast.error('Swap failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

      const confirmAndSendPendingSwap = async () => {
        if (!pendingTx) return null;
        try {
          const sig = await sendTransaction(pendingTx, connection);
          setConfirmOpen(false);
          setPendingTx(null);
          setTxSignature(sig);
          toast.success('Swap submitted: ' + sig);
          return sig;
        } catch (err) {
          toast.error('Failed to submit swap: ' + (err as any)?.message);
          return null;
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
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
            <Settings className="w-5 h-5 text-gray-300" />
          </button>
          <button onClick={() => setWalletModalOpen(true)} className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm">Programmatic Wallet</button>
        </div>
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
          <button onClick={() => setSelecting('from')} className="flex items-center space-x-2 bg-gray-600 rounded-lg px-3 py-2 hover:bg-gray-500">
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
          </button>
        </div>
        {fromUsd !== undefined && !isNaN(fromUsd) && (
          <div className="text-xs text-gray-400 mt-1">≈ ${fromUsd.toFixed(2)}</div>
        )}
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
          <button onClick={() => setSelecting('to')} className="flex items-center space-x-2 bg-gray-600 rounded-lg px-3 py-2 hover:bg-gray-500">
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
          </button>
        </div>
        {toUsd !== undefined && !isNaN(toUsd) && (
          <div className="text-xs text-gray-400 mt-1">≈ ${toUsd.toFixed(2)}</div>
        )}
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

      {/* Advanced (optional) - allow user to paste pool/account addresses to execute real txs */}
      <div className="mt-4 bg-gray-800/20 rounded-lg p-3 text-sm text-gray-300">
        <div className="mb-2 font-semibold">Advanced (optional)</div>
        <input
          type="text"
          value={poolAddress}
          onChange={(e) => setPoolAddress(e.target.value)}
          placeholder="Pool address (paste to execute a real swap)"
          className="w-full mb-2 bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 outline-none"
        />
        <input
          type="text"
          value={userTokenAAccount}
          onChange={(e) => setUserTokenAAccount(e.target.value)}
          placeholder="Your token A account (associated token account)"
          className="w-full mb-2 bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 outline-none"
        />
        <input
          type="text"
          value={userTokenBAccount}
          onChange={(e) => setUserTokenBAccount(e.target.value)}
          placeholder="Your token B account (associated token account)"
          className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 outline-none"
        />
        <input
          type="text"
          value={tokenAVault}
          onChange={(e) => setTokenAVault(e.target.value)}
          placeholder="Pool Token A vault address"
          className="w-full mt-2 bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 outline-none"
        />
        <input
          type="text"
          value={tokenBVault}
          onChange={(e) => setTokenBVault(e.target.value)}
          placeholder="Pool Token B vault address"
          className="w-full mt-2 bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 outline-none"
        />
      </div>

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
      {/* Programmatic Wallet Modal */}
      {walletModalOpen && (
        // import client-only component
        // eslint-disable-next-line @next/next/no-img-element
        <ProgrammaticWalletModal open={walletModalOpen} onClose={() => setWalletModalOpen(false)} />
      )}
      {txSignature && (
        <div className="mt-3 p-3 bg-gray-800/40 rounded-lg text-sm">
          <div className="text-gray-300">Transaction submitted</div>
          <a
            className="text-primary-400 underline"
            href={`https://explorer.solana.com/tx/${txSignature}${process.env.NEXT_PUBLIC_NETWORK === 'devnet' ? '?cluster=devnet' : process.env.NEXT_PUBLIC_NETWORK === 'testnet' ? '?cluster=testnet' : ''}`}
            target="_blank"
            rel="noreferrer"
          >
            View on Solana Explorer
          </a>
        </div>
      )}
          <ConfirmTransactionModal
            open={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            tx={pendingTx}
            summaryTitle="Confirm Swap"
            summaryItems={summaryItems}
            onConfirm={confirmAndSendPendingSwap}
          />
    </div>
  );
}