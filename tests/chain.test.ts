import { describe, it, expect } from 'vitest';
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { getPoolReserves } from '../lib/chain';

// Helper to build a fake account buffer with u64 reserves at offsets used by getPoolReserves
function buildPoolAccountBuffer(tokenAReserve: bigint, tokenBReserve: bigint, lpSupply: bigint) {
  const len = 200;
  const buf = new ArrayBuffer(len);
  const dv = new DataView(buf);
  // write reserves at offsets 163, 171, 179 little-endian
  dv.setBigUint64(163, tokenAReserve, true);
  dv.setBigUint64(171, tokenBReserve, true);
  dv.setBigUint64(179, lpSupply, true);
  return new Uint8Array(buf);
}

describe('getPoolReserves', () => {
  it('parses reserves from pool account bytes', async () => {
    const a = BigInt(123456789);
    const b = BigInt(987654321);
    const s = BigInt(5555555);

    // Mock connection
    const mockConnection = {
      getAccountInfo: async (pubkey: PublicKey | string) => {
        return { data: buildPoolAccountBuffer(a, b, s) } as any;
      },
    } as unknown as Connection;

  const pool = Keypair.generate().publicKey;
    const res = await getPoolReserves(mockConnection, pool);
    expect(res).not.toBeNull();
    expect(res?.tokenAReserve).toEqual(a);
    expect(res?.tokenBReserve).toEqual(b);
    expect(res?.lpSupply).toEqual(s);
  });

  it('reads token vault balances when provided', async () => {
    const aAmt = '1000';
    const bAmt = '2000';

    const pool = Keypair.generate().publicKey;
    const vaultA = Keypair.generate().publicKey;
    const vaultB = Keypair.generate().publicKey;

    const mockConnection = {
      getParsedAccountInfo: async (pubkey: PublicKey) => {
        // return parsed token account info
        if (pubkey.equals(vaultA)) {
          return { value: { data: { parsed: { info: { tokenAmount: { amount: aAmt } } } } } } as any;
        }
        if (pubkey.equals(vaultB)) {
          return { value: { data: { parsed: { info: { tokenAmount: { amount: bAmt } } } } } } as any;
        }
        return { value: null } as any;
      },
      getAccountInfo: async () => null,
    } as unknown as Connection;

    const res = await getPoolReserves(mockConnection, pool, vaultA, vaultB);
    expect(res).not.toBeNull();
    expect(res?.tokenAReserve).toEqual(BigInt(aAmt));
    expect(res?.tokenBReserve).toEqual(BigInt(bAmt));
  });
});
