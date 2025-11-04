import { useEffect, useMemo, useRef, useState } from 'react';
import type { TokenInfo as AppTokenInfo } from './constants';

const DEFAULT_TOKEN_LIST = process.env.NEXT_PUBLIC_TOKEN_LIST_URL || 'https://token.jup.ag/all';

export interface TokenListItem {
  address: string; // mint
  chainId?: number;
  decimals: number;
  name: string;
  symbol: string;
  logoURI?: string;
  tags?: string[];
  extensions?: Record<string, any>;
}

let tokenCache: Map<string, AppTokenInfo> | null = null;

export async function fetchTokenList(url = DEFAULT_TOKEN_LIST): Promise<Map<string, AppTokenInfo>> {
  if (tokenCache) return tokenCache;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Token list fetch failed: ${res.status}`);
  const list: TokenListItem[] = await res.json();
  const map = new Map<string, AppTokenInfo>();
  list.forEach((t) => {
    map.set(t.address, {
      mint: t.address,
      symbol: t.symbol,
      name: t.name,
      decimals: t.decimals,
      logoURI: t.logoURI,
    });
  });
  tokenCache = map;
  return map;
}

export function useTokenList() {
  const [map, setMap] = useState<Map<string, AppTokenInfo> | null>(tokenCache);
  const [loading, setLoading] = useState(!tokenCache);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    if (!tokenCache) {
      fetchTokenList()
        .then((m) => {
          if (mounted.current) {
            setMap(m);
            setError(null);
          }
        })
        .catch((e) => mounted.current && setError(e?.message || 'Failed to load token list'))
        .finally(() => mounted.current && setLoading(false));
    } else {
      setLoading(false);
    }
    return () => {
      mounted.current = false;
    };
  }, []);

  const getByMint = useMemo(() => {
    return (mint: string | undefined | null): AppTokenInfo | undefined => {
      if (!mint || !map) return undefined;
      return map.get(mint);
    };
  }, [map]);

  return { tokenMap: map, getByMint, loading, error };
}
