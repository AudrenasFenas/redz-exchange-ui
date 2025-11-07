import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import { PROGRAM_ID, RedzInstruction } from './constants';

// Create instruction to initialize config
export function createInitializeConfigInstruction(
  authority: PublicKey,
  config: PublicKey,
  feeRate: number
): TransactionInstruction {
  const data = Buffer.concat([
    Buffer.from([RedzInstruction.InitializeConfig]),
    Buffer.from(new Uint16Array([feeRate]).buffer),
  ]);

  return new TransactionInstruction({
    keys: [
      { pubkey: authority, isSigner: true, isWritable: true },
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
    tokenAMint.toBuffer(),
    tokenBMint.toBuffer(),
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
      { pubkey: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), isSigner: false, isWritable: false },
      { pubkey: new PublicKey('11111111111111111111111111111112'), isSigner: false, isWritable: false },
      { pubkey: new PublicKey('SysvarRent111111111111111111111111111111111'), isSigner: false, isWritable: false },
    ],
    programId: new PublicKey(PROGRAM_ID),
    data,
  });
}

// Create instruction for token swap
export function createSwapInstruction(
  user: PublicKey,
  pool: PublicKey,
  userInput: PublicKey,
  userOutput: PublicKey,
  inputVault: PublicKey,
  outputVault: PublicKey,
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
      { pubkey: userInput, isSigner: false, isWritable: true },
      { pubkey: userOutput, isSigner: false, isWritable: true },
      { pubkey: inputVault, isSigner: false, isWritable: true },
      { pubkey: outputVault, isSigner: false, isWritable: true },
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
  name: string,
  symbol: string,
  totalSupply: number,
  targetAmount: number,
  duration: number
): TransactionInstruction {
  const nameBytes = Buffer.from(name);
  const symbolBytes = Buffer.from(symbol);
  const data = Buffer.concat([
    Buffer.from([RedzInstruction.LaunchToken]),
    Buffer.from(new Uint32Array([nameBytes.length]).buffer),
    nameBytes,
    Buffer.from(new Uint32Array([symbolBytes.length]).buffer),
    symbolBytes,
    Buffer.from(new BigUint64Array([BigInt(totalSupply)]).buffer),
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

// Create instruction to add liquidity to a pool
export function createAddLiquidityInstruction(
  user: PublicKey,
  pool: PublicKey,
  userTokenA: PublicKey,
  userTokenB: PublicKey,
  tokenAVault: PublicKey,
  tokenBVault: PublicKey,
  amountA: number,
  amountB: number
): TransactionInstruction {
  const data = Buffer.concat([
    Buffer.from([RedzInstruction.AddLiquidity]),
    Buffer.from(new BigUint64Array([BigInt(amountA)]).buffer),
    Buffer.from(new BigUint64Array([BigInt(amountB)]).buffer),
  ]);

  return new TransactionInstruction({
    keys: [
      { pubkey: user, isSigner: true, isWritable: false },
      { pubkey: pool, isSigner: false, isWritable: true },
      { pubkey: userTokenA, isSigner: false, isWritable: true },
      { pubkey: userTokenB, isSigner: false, isWritable: true },
      { pubkey: tokenAVault, isSigner: false, isWritable: true },
      { pubkey: tokenBVault, isSigner: false, isWritable: true },
      { pubkey: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), isSigner: false, isWritable: false },
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