import { useEffect, useMemo, useRef, useState } from 'react';

const DEFAULT_PRICE_API = process.env.NEXT_PUBLIC_PRICE_API || 'https://price.jup.ag/v6/price';

export type PriceMap = Record<string, number>; // mint -> price in USD

async function fetchPricesChunk(mints: string[], api = DEFAULT_PRICE_API): Promise<PriceMap> {
  if (mints.length === 0) return {};
  const url = new URL(api);
  // Jupiter v6 supports `ids` with either symbols or mints; we pass mints
  url.searchParams.set('ids', mints.join(','));

  const res = await fetch(url.toString(), { cache: 'no-store' });
  if (!res.ok) throw new Error(`Price API error: ${res.status}`);
  const json = await res.json();
  // Response shape: { data: { [id]: { id, price, mintSymbol?, ... } } }
  const out: PriceMap = {};
  if (json && json.data) {
    Object.entries<any>(json.data).forEach(([id, v]) => {
      if (v && typeof v.price === 'number') out[id] = v.price;
    });
  }
  return out;
}

export async function getPricesByMint(mints: string[], api = DEFAULT_PRICE_API): Promise<PriceMap> {
  // Chunk to avoid overly long URLs. Jupiter supports many, but keep safe.
  const CHUNK = 80;
  const chunks: string[][] = [];
  for (let i = 0; i < mints.length; i += CHUNK) chunks.push(mints.slice(i, i + CHUNK));

  const results = await Promise.all(chunks.map((c) => fetchPricesChunk(c, api).catch(() => ({}))));
  return results.reduce((acc, cur) => Object.assign(acc, cur), {} as PriceMap);
}

// Simple polling hook for prices
export function usePrices(mints: string[], intervalMs = 15000) {
  const [prices, setPrices] = useState<PriceMap>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mintsKey = useMemo(() => Array.from(new Set(mints)).sort().join(','), [mints]);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    async function tick() {
      try {
        setLoading(true);
        const data = await getPricesByMint(mints);
        if (mounted.current) {
          setPrices(data);
          setError(null);
        }
      } catch (e: any) {
        if (mounted.current) setError(e?.message || 'Failed to fetch prices');
      } finally {
        if (mounted.current) setLoading(false);
      }
    }

    // initial fetch
    tick();
    // polling
    const id = setInterval(tick, intervalMs);
    return () => {
      mounted.current = false;
      clearInterval(id);
    };
  }, [mintsKey, intervalMs]);

  return { prices, loading, error };
}
