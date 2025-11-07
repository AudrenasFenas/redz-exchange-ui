import { describe, it, expect } from 'vitest';
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccountInstructions } from '../lib/token';

describe('token helpers', () => {
  it('returns ata and creation instructions when ATA missing', async () => {
    const mockConnection = {
      getAccountInfo: async (pubkey: PublicKey) => null,
    } as unknown as Connection;

  const owner = Keypair.generate().publicKey;
  const mint = Keypair.generate().publicKey;

    const res = await getOrCreateAssociatedTokenAccountInstructions(mockConnection, owner, owner, mint);
    expect(res).toHaveProperty('ata');
    expect(res).toHaveProperty('instructions');
    expect(Array.isArray(res.instructions)).toBe(true);
  });
});
