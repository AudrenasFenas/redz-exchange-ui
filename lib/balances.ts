import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { useEffect, useMemo, useRef, useState } from 'react';
import { POPULAR_TOKENS } from './constants';
import { usePrices } from './prices';

// Token Program ID (avoid adding @solana/spl-token dependency)
export const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

export interface TokenBalanceItem {
  mint: string;
  symbol: string;
  decimals: number;
  amount: number; // ui amount
  usd?: number;
  logoURI?: string;
}

export function useTokenBalances(trackMints: string[] = POPULAR_TOKENS.map(t => t.mint), pollMs = 20000) {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [sol, setSol] = useState<number>(0);
  const [tokens, setTokens] = useState<TokenBalanceItem[]>([]);
  const mounted = useRef(true);
  const { prices } = usePrices(trackMints.concat('So11111111111111111111111111111111111111112'), 15000);

  const symbolsByMint = useMemo(() => {
    const m = new Map<string, { symbol: string; decimals: number; logoURI?: string }>();
    POPULAR_TOKENS.forEach(t => m.set(t.mint, { symbol: t.symbol, decimals: t.decimals, logoURI: t.logoURI }));
    // Add SOL
    m.set('So11111111111111111111111111111111111111112', { symbol: 'SOL', decimals: 9 });
    return m;
  }, []);

  useEffect(() => {
    mounted.current = true;
    async function fetchAll() {
      if (!publicKey || !connection) return;
      try {
        const lamports = await connection.getBalance(publicKey);
        if (!mounted.current) return;
        setSol(lamports / LAMPORTS_PER_SOL);

        const parsed = await connection.getParsedTokenAccountsByOwner(publicKey, { programId: TOKEN_PROGRAM_ID });
        if (!mounted.current) return;
        const byMint = new Map<string, number>();
        parsed.value.forEach((acc) => {
          const info: any = acc.account.data.parsed?.info;
          const mint = info?.mint as string;
          const amount = Number(info?.tokenAmount?.uiAmount) || 0;
          if (mint) {
            byMint.set(mint, (byMint.get(mint) || 0) + amount);
          }
        });

        const list: TokenBalanceItem[] = trackMints.map((mint) => {
          const meta = symbolsByMint.get(mint) || { symbol: mint.slice(0, 4), decimals: 0 };
          const amount = byMint.get(mint) || 0;
          const price = prices[mint];
          return {
            mint,
            symbol: meta.symbol,
            decimals: meta.decimals,
            logoURI: meta.logoURI,
            amount,
            usd: price ? amount * price : undefined,
          };
        });
        if (mounted.current) setTokens(list);
      } catch (e) {
        // silent
      }
    }

    fetchAll();
    const id = setInterval(fetchAll, pollMs);
    return () => { mounted.current = false; clearInterval(id); };
  }, [publicKey?.toBase58(), connection, pollMs, trackMints.join('|'), symbolsByMint, prices]);

  const solUsd = prices['So11111111111111111111111111111111111111112'] ? sol * prices['So11111111111111111111111111111111111111112'] : undefined;
  return { sol, solUsd, tokens };
}
