import { describe, it, expect, vi } from 'vitest';

// Mock the alchemy-sdk module to provide a fake Alchemy client with wallet.createProgrammaticWallet
vi.mock('alchemy-sdk', () => {
  return {
    Alchemy: class {
      wallet: any;
      constructor(opts: any) {
        this.wallet = {
          createProgrammaticWallet: async (body: any) => ({ created: true, body }),
        };
      }
    },
  };
});

describe('Alchemy SDK integration path', () => {
  it('uses the SDK create method when ALCHEMY_USE_SDK=true', async () => {
    process.env.ALCHEMY_USE_SDK = 'true';
    process.env.ALCHEMY_API_KEY = 'testkey';
    process.env.ALCHEMY_WALLET_API_URL = 'https://example.test/wallets';

    const { POST } = await import('../app/api/alchemy/create-wallet/route');
    const fakeReq = { json: async () => ({ label: 'sdk-wallet', chain: 'solana' }) } as unknown as Request;
    const res = await POST(fakeReq);
    const json = await res.json();

    expect(json.success).toBe(true);
    expect(json.body.created).toBe(true);
    expect(json.body.body.label).toBe('sdk-wallet');
  });
});
