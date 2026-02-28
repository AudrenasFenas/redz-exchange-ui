import { describe, it, expect, beforeEach, vi } from 'vitest';

// Clear env between tests
function clearEnv() {
  delete process.env['Wt1fDpl-i0CUocrCJe0m1'];
  delete process.env['https://solana-mainnet.g.alchemy.com/v2/Wt1fDpl-i0CUocrCJe0m1'];
}

describe('Alchemy create-wallet route', () => {
  beforeEach(() => {
    clearEnv();
    vi.restoreAllMocks();
  });

  it('returns 501 when env vars missing', async () => {
    const { POST } = await import('../app/api/alchemy/create-wallet/route');
    const fakeReq = { json: async () => ({}) } as unknown as Request;
    const res = await POST(fakeReq);
    // res is a NextResponse; convert to JSON
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.required_env).toContain('ALCHEMY_API_KEY');
  });

  it('forwards whitelisted fields to Alchemy and returns its response', async () => {
    process.env.ALCHEMY_API_KEY = 'testkey';
    process.env.ALCHEMY_WALLET_API_URL = 'https://example.test/wallets';

    // Mock global fetch
    const mockFetch = vi.fn(async (url, opts) => {
      expect(url).toBe(process.env.ALCHEMY_WALLET_API_URL);
      const body = JSON.parse(opts?.body || '{}');
      // Ensure only whitelisted keys are forwarded
      expect(body.label).toBe('mylabel');
      expect(body.chain).toBe('solana');
      expect(body.metadata).toBeDefined();
      expect(body.unwanted).toBeUndefined();

      return {
        ok: true,
        status: 201,
        json: async () => ({ wallet: 'created' }),
      } as any;
    });

    vi.stubGlobal('fetch', mockFetch as any);

    const { POST } = await import('../app/api/alchemy/create-wallet/route');
    const fakeReq = { json: async () => ({ label: 'mylabel', chain: 'solana', metadata: { purpose: 'x' }, unwanted: 'x' }) } as unknown as Request;
    const res = await POST(fakeReq);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.body.wallet).toBe('created');
    expect(mockFetch).toHaveBeenCalled();
  });
});
