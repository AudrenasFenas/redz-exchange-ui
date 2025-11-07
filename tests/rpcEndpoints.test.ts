import { describe, it, expect, beforeEach } from 'vitest';

// We will set env vars before importing the tested module to ensure it reads them at runtime
function resetEnv() {
  delete process.env.NEXT_PUBLIC_RPC_URL;
}

describe('computeEndpointsForNetwork', () => {
  beforeEach(() => {
    resetEnv();
  });

  it('includes override at the front when NEXT_PUBLIC_RPC_URL is set', async () => {
    process.env.NEXT_PUBLIC_RPC_URL = 'https://example-override.test';
    // import dynamically so it reads the env at import time
    const { computeEndpointsForNetwork } = await import('../lib/rpc');
    const endpoints = computeEndpointsForNetwork('mainnet');
    expect(endpoints[0]).toBe('https://example-override.test');
  });

  it('does not duplicate override if already present', async () => {
    // Simulate override equal to an existing endpoint
    // Use an endpoint known to be in constants (projectserum)
    process.env.NEXT_PUBLIC_RPC_URL = 'https://solana-api.projectserum.com';
    const { computeEndpointsForNetwork } = await import('../lib/rpc');
    const endpoints = computeEndpointsForNetwork('mainnet');
    // It should still be first, but not duplicated
    expect(endpoints[0]).toBe('https://solana-api.projectserum.com');
    const occurrences = endpoints.filter(e => e === 'https://solana-api.projectserum.com').length;
    expect(occurrences).toBe(1);
  });

  it('returns base endpoints when no override is set', async () => {
    const { computeEndpointsForNetwork } = await import('../lib/rpc');
    const endpoints = computeEndpointsForNetwork('mainnet');
    expect(Array.isArray(endpoints)).toBe(true);
    expect(endpoints.length).toBeGreaterThan(0);
  });
});
