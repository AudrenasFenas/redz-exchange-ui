import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import { PROGRAM_ID, RedzInstruction } from './constants';

// Create instruction to initialize config
export function createInitializeConfigInstruction(
  admin: PublicKey,
  config: PublicKey,
  defaultFeeRate: number,
  launchCreationFee: number,
  minLiquidity: number
): TransactionInstruction {
  const data = Buffer.concat([
    Buffer.from([RedzInstruction.InitializeConfig]),
    Buffer.from(new Uint16Array([defaultFeeRate]).buffer),
    Buffer.from(new BigUint64Array([BigInt(launchCreationFee)]).buffer),
    Buffer.from(new BigUint64Array([BigInt(minLiquidity)]).buffer),
  ]);

  return new TransactionInstruction({
    keys: [
      { pubkey: admin, isSigner: true, isWritable: true },
      { pubkey: config, isSigner: false, isWritable: true },
      { pubkey: new PublicKey('11111111111111111111111111111112'), isSigner: false, isWritable: false },
    ],
    programId: new PublicKey(PROGRAM_ID),
    data,
  });
}

// Create instruction to create pool
export function createPoolInstruction(
  authority: PublicKey,
  pool: PublicKey,
  tokenAMint: PublicKey,
  tokenBMint: PublicKey,
  tokenAVault: PublicKey,
  tokenBVault: PublicKey,
  lpTokenMint: PublicKey,
  feeRate: number
): TransactionInstruction {
  const data = Buffer.concat([
    Buffer.from([RedzInstruction.CreatePool]),
    Buffer.from(new Uint16Array([feeRate]).buffer),
  ]);

  return new TransactionInstruction({
    keys: [
      { pubkey: authority, isSigner: true, isWritable: true },
      { pubkey: pool, isSigner: false, isWritable: true },
      { pubkey: tokenAMint, isSigner: false, isWritable: false },
      { pubkey: tokenBMint, isSigner: false, isWritable: false },
      { pubkey: tokenAVault, isSigner: false, isWritable: true },
      { pubkey: tokenBVault, isSigner: false, isWritable: true },
      { pubkey: lpTokenMint, isSigner: false, isWritable: true },
      { pubkey: new PublicKey('11111111111111111111111111111112'), isSigner: false, isWritable: false },
    ],
    programId: new PublicKey(PROGRAM_ID),
    data,
  });
}

// Create instruction for token swap
export function createSwapInstruction(
  user: PublicKey,
  pool: PublicKey,
  userTokenAAccount: PublicKey,
  userTokenBAccount: PublicKey,
  tokenAVault: PublicKey,
  tokenBVault: PublicKey,
  amountIn: number,
  minimumAmountOut: number
): TransactionInstruction {
  const data = Buffer.concat([
    Buffer.from([RedzInstruction.Swap]),
    Buffer.from(new BigUint64Array([BigInt(amountIn)]).buffer),
    Buffer.from(new BigUint64Array([BigInt(minimumAmountOut)]).buffer),
  ]);

  return new TransactionInstruction({
    keys: [
      { pubkey: user, isSigner: true, isWritable: false },
      { pubkey: pool, isSigner: false, isWritable: true },
      { pubkey: userTokenAAccount, isSigner: false, isWritable: true },
      { pubkey: userTokenBAccount, isSigner: false, isWritable: true },
      { pubkey: tokenAVault, isSigner: false, isWritable: true },
      { pubkey: tokenBVault, isSigner: false, isWritable: true },
      { pubkey: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), isSigner: false, isWritable: false },
    ],
    programId: new PublicKey(PROGRAM_ID),
    data,
  });
}

// Create instruction to launch token
export function createLaunchTokenInstruction(
  launcher: PublicKey,
  launch: PublicKey,
  tokenMint: PublicKey,
  tokenAmount: number,
  targetAmount: number,
  duration: number
): TransactionInstruction {
  const data = Buffer.concat([
    Buffer.from([RedzInstruction.LaunchToken]),
    Buffer.from(new BigUint64Array([BigInt(tokenAmount)]).buffer),
    Buffer.from(new BigUint64Array([BigInt(targetAmount)]).buffer),
    Buffer.from(new BigUint64Array([BigInt(duration)]).buffer),
  ]);

  return new TransactionInstruction({
    keys: [
      { pubkey: launcher, isSigner: true, isWritable: true },
      { pubkey: launch, isSigner: false, isWritable: true },
      { pubkey: tokenMint, isSigner: false, isWritable: false },
      { pubkey: new PublicKey('11111111111111111111111111111112'), isSigner: false, isWritable: false },
    ],
    programId: new PublicKey(PROGRAM_ID),
    data,
  });
}

// Helper to calculate swap output
export function calculateSwapOutput(
  amountIn: number,
  reserveIn: number,
  reserveOut: number,
  feeRate: number
): number {
  const amountInWithFee = amountIn * (10000 - feeRate);
  const numerator = amountInWithFee * reserveOut;
  const denominator = (reserveIn * 10000) + amountInWithFee;
  return Math.floor(numerator / denominator);
}

// Helper to calculate price impact
export function calculatePriceImpact(
  amountIn: number,
  amountOut: number,
  reserveIn: number,
  reserveOut: number
): number {
  const spotPrice = reserveOut / reserveIn;
  const executionPrice = amountOut / amountIn;
  return Math.abs((spotPrice - executionPrice) / spotPrice) * 100;
}