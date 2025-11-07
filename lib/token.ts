import { Connection, PublicKey } from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
} from '@solana/spl-token';

// Derive the associated token account for an owner + mint
export async function deriveAssociatedTokenAddress(mint: PublicKey, owner: PublicKey) {
  return await getAssociatedTokenAddress(mint, owner);
}

// Return instructions required to ensure the associated token account exists (create if missing)
export async function getOrCreateAssociatedTokenAccountInstructions(
  connection: Connection,
  payer: PublicKey,
  owner: PublicKey,
  mint: PublicKey
) {
  const ata = await getAssociatedTokenAddress(mint, owner);

  const info = await connection.getAccountInfo(ata);
  const instructions: any[] = [];

  if (!info) {
    // createAssociatedTokenAccountInstruction(payer, associatedToken, owner, mint)
    instructions.push(createAssociatedTokenAccountInstruction(payer, ata, owner, mint));
  }

  return { ata, instructions };
}

// Create a transferChecked instruction moving `amount` (integer, raw units) of `mint` from source to dest
export function createTokenTransferInstruction(
  source: PublicKey,
  destination: PublicKey,
  owner: PublicKey,
  mint: PublicKey,
  amount: number,
  decimals: number
) {
  // createTransferCheckedInstruction(source, mint, destination, owner, amount, decimals)
  return createTransferCheckedInstruction(source, mint, destination, owner, BigInt(amount), decimals);
}

export default {};
