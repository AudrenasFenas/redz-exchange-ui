'use client';

import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccountInstructions, createTokenTransferInstruction } from '@/lib/token';
import { getPoolReserves, estimateTransactionFee } from '@/lib/chain';
import ConfirmTransactionModal from './ConfirmTransactionModal';
import { Plus, Minus, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { POPULAR_TOKENS } from '@/lib/constants';
import ProgrammaticWalletModal from './ProgrammaticWalletModal';

export function PoolInterface() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'add' | 'remove' | 'create'>('add');
  
  // Add Liquidity State
  const [tokenA, setTokenA] = useState(POPULAR_TOKENS[0]);
  const [tokenB, setTokenB] = useState(POPULAR_TOKENS[1]);
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');
  const [poolAddress, setPoolAddress] = useState('');
  const [tokenAVault, setTokenAVault] = useState('');
  const [tokenBVault, setTokenBVault] = useState('');
  const [lpMint, setLpMint] = useState('');
  const [pendingTx, setPendingTx] = useState<Transaction | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [summaryItems, setSummaryItems] = useState<{ label: string; value: string }[]>([]);
  
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

    // If pool info is provided, attempt to build and send a real transaction
    if (poolAddress && tokenAVault && tokenBVault && lpMint) {
      try {
        const poolPub = new PublicKey(poolAddress);
        const tokenAVaultPub = new PublicKey(tokenAVault);
        const tokenBVaultPub = new PublicKey(tokenBVault);
        const lpMintPub = new PublicKey(lpMint);

        // For user token accounts we assume user has associated token accounts; use placeholders
        // The UI does not derive associated token accounts automatically yet — for safety we ask user to supply
        // but as a convenience we will attempt to use token vaults as targets if user accounts not provided
        // NOTE: For production this should derive or create associated token accounts.
        const amtA = Math.floor(Number(amountA) * Math.pow(10, tokenA.decimals));
        const amtB = Math.floor(Number(amountB) * Math.pow(10, tokenB.decimals));

        // Prepare user's associated token accounts and creation instructions
        const mintAPub = new PublicKey(tokenA.mint);
        const mintBPub = new PublicKey(tokenB.mint);

        const ataARes = await getOrCreateAssociatedTokenAccountInstructions(connection, publicKey as PublicKey, publicKey as PublicKey, mintAPub);
        const ataBRes = await getOrCreateAssociatedTokenAccountInstructions(connection, publicKey as PublicKey, publicKey as PublicKey, mintBPub);

        const userTokenAAccount = ataARes.ata;
        const userTokenBAccount = ataBRes.ata;

        const transferA = createTokenTransferInstruction(userTokenAAccount, tokenAVaultPub, publicKey as PublicKey, mintAPub, amtA, tokenA.decimals);
        const transferB = createTokenTransferInstruction(userTokenBAccount, tokenBVaultPub, publicKey as PublicKey, mintBPub, amtB, tokenB.decimals);

        const { createAddLiquidityInstruction } = await import('@/lib/instructions');

        const ix = createAddLiquidityInstruction(
          publicKey as PublicKey,
          poolPub,
          userTokenAAccount,
          userTokenBAccount,
          tokenAVaultPub,
          tokenBVaultPub,
          amtA,
          amtB
        );

        const tx = new Transaction();
        // Add ATA creation instructions if needed
        ataARes.instructions.forEach((i: any) => tx.add(i));
        ataBRes.instructions.forEach((i: any) => tx.add(i));
        // Transfer tokens to vaults
        tx.add(transferA);
        tx.add(transferB);
        // Add the program instruction to mint LP / register liquidity
        tx.add(ix);

        // Fetch pool reserves if possible and estimate fee
  const tokenAVaultPubProvided = tokenAVault ? new PublicKey(tokenAVault) : undefined;
  const tokenBVaultPubProvided = tokenBVault ? new PublicKey(tokenBVault) : undefined;
  const reserves = await getPoolReserves(connection, poolPub, tokenAVaultPubProvided, tokenBVaultPubProvided).catch(() => null);
        const feeEstimate = await estimateTransactionFee(connection, tx, publicKey as PublicKey).catch(() => null);

        const items: { label: string; value: string }[] = [
          { label: 'Pool', value: poolAddress },
          { label: 'Token A', value: `${tokenA.symbol} ${ (Number(amountA) / Math.pow(10, tokenA.decimals)).toFixed(6) }` },
          { label: 'Token B', value: `${tokenB.symbol} ${ (Number(amountB) / Math.pow(10, tokenB.decimals)).toFixed(6) }` },
        ];

        if (reserves) {
          items.push({ label: 'Reserve A', value: reserves.tokenAReserve.toString() });
          items.push({ label: 'Reserve B', value: reserves.tokenBReserve.toString() });
        }
        if (feeEstimate !== null) {
          items.push({ label: 'Estimated Fee (lamports)', value: feeEstimate.toString() });
        }

        setSummaryItems(items);
        setPendingTx(tx);
        setConfirmOpen(true);
      } catch (err) {
        console.error('Add liquidity error', err);
        toast.error('Failed to add liquidity: ' + (err as any)?.message);
      }
      return;
    }

    // Fallback: demo mode when pool data not provided
    try {
      toast.success('Add liquidity (demo) — provide pool/vault/mint addresses to execute a real transaction');
    } catch (error) {
      toast.error('Failed to add liquidity');
    }
  };

  const confirmAndSendPending = async () => {
    if (!pendingTx) return null;
    try {
      const sig = await sendTransaction(pendingTx, connection);
      setConfirmOpen(false);
      setPendingTx(null);
      toast.success('Transaction submitted: ' + sig);
      return sig;
    } catch (err) {
      toast.error('Failed to submit transaction: ' + (err as any)?.message);
      return null;
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
        <div className="ml-4">
          <button onClick={() => setWalletModalOpen(true)} className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm">Programmatic Wallet</button>
        </div>
      </div>
      <ConfirmTransactionModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        tx={pendingTx}
        summaryTitle="Confirm Add Liquidity"
        summaryItems={summaryItems}
        onConfirm={confirmAndSendPending}
      />
      {walletModalOpen && (
        <ProgrammaticWalletModal open={walletModalOpen} onClose={() => setWalletModalOpen(false)} />
      )}

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

              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">Pool Address (optional)</label>
                <input
                  type="text"
                  value={poolAddress}
                  onChange={(e) => setPoolAddress(e.target.value)}
                  placeholder="Paste pool account public key to execute a real add-liquidity tx"
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 outline-none focus:border-primary-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 mb-6">
                <input
                  type="text"
                  value={tokenAVault}
                  onChange={(e) => setTokenAVault(e.target.value)}
                  placeholder="Token A vault address (required for real tx)"
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 outline-none focus:border-primary-500"
                />
                <input
                  type="text"
                  value={tokenBVault}
                  onChange={(e) => setTokenBVault(e.target.value)}
                  placeholder="Token B vault address (required for real tx)"
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 outline-none focus:border-primary-500"
                />
                <input
                  type="text"
                  value={lpMint}
                  onChange={(e) => setLpMint(e.target.value)}
                  placeholder="LP token mint (required for real tx)"
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 outline-none focus:border-primary-500"
                />
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