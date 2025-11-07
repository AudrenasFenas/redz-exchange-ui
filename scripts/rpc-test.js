#!/usr/bin/env node
// Simple RPC endpoint tester (JS) — avoids importing TypeScript directly.
// Builds the same Alchemy-derived endpoints from NEXT_PUBLIC_ALCHEMY_API_KEY and
// issues a JSON-RPC `getLatestBlockhash` call to measure success and latency.

const RPC_URL_OVERRIDE = process.env.NEXT_PUBLIC_RPC_URL || '';
const ALCHEMY_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || '';
let ALCHEMY_MAINNET = ALCHEMY_KEY
  ? `https://solana-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`
  : 'https://solana-mainnet.g.alchemy.com/v2/demo';

// If a full RPC URL is provided (e.g. via .env.local NEXT_PUBLIC_RPC_URL), prefer that
// This allows using an already-configured Alchemy URL without extracting or printing the key
if (RPC_URL_OVERRIDE) {
  ALCHEMY_MAINNET = RPC_URL_OVERRIDE;
}

const endpoints = [
  'https://solana-api.projectserum.com',
  'https://rpc.ankr.com/solana',
  ALCHEMY_MAINNET,
  'https://api.mainnet-beta.solana.com',
  'https://ssc-dao.genesysgo.net',
  'https://solana-mainnet.phantom.tech',
  'https://api.quicknode.com/solana',
];

async function testEndpoint(endpoint) {
  const start = Date.now();
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getLatestBlockhash', params: [] }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.error) throw new Error(JSON.stringify(json.error));

    return { endpoint, success: true, latency: Date.now() - start };
  } catch (err) {
    return { endpoint, success: false, latency: Date.now() - start, error: err?.message || String(err) };
  }
}

(async () => {
  const results = await Promise.all(endpoints.map(testEndpoint));
  console.log(JSON.stringify(results, null, 2));
})();
