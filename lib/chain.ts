import { Connection, PublicKey, Transaction } from '@solana/web3.js';

// Known SPL Token program id
const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

export interface PoolReserves {
  tokenAReserve: bigint;
  tokenBReserve: bigint;
  lpSupply: bigint;
}

// Attempt to parse a pool account for reserve values using a best-effort layout.
// Layout assumed (in bytes):
// 0: isInitialized (1)
// 1: tokenAMint (32)
// 33: tokenBMint (32)
// 65: tokenAVault (32)
// 97: tokenBVault (32)
// 129: lpTokenMint (32)
// 161: feeRate (u16)
// 163: tokenAReserve (u64)
// 171: tokenBReserve (u64)
// 179: lpTokenSupply (u64)
/**
 * Retrieves the reserve amounts for tokens A and B from a liquidity pool.
 * 
 * @param connection - The Solana RPC connection to use for fetching account data
 * @param pool - The public key of the pool account to query reserves from
 * @param tokenAVault - Optional public key of token A's vault account for direct balance reading
 * @param tokenBVault - Optional public key of token B's vault account for direct balance reading
 * 
 * @returns A promise that resolves to a PoolReserves object containing tokenAReserve, 
 *          tokenBReserve, and lpSupply amounts as BigInt values, or null if the data 
 *          cannot be retrieved or parsed
 * 
 * @remarks
 * This function uses a two-tier approach:
 * 1. If vault addresses are provided, it attempts to read token account balances directly (most reliable)
 * 2. Falls back to parsing the pool account's raw byte data using known offsets
 * 
 * The function gracefully handles errors and will return null if neither approach succeeds.
 */
export async function getPoolReserves(
  connection: Connection,
  pool: PublicKey,
  tokenAVault?: PublicKey,
  tokenBVault?: PublicKey
): Promise<PoolReserves | null> {
  // If vault addresses are provided, prefer reading token account balances (most reliable)
  try {
    if (tokenAVault && tokenBVault) {
      const [aInfo, bInfo] = await Promise.all([
        connection.getParsedAccountInfo(tokenAVault),
        connection.getParsedAccountInfo(tokenBVault),
      ]);

      const aData: any = aInfo.value?.data;
      const bData: any = bInfo.value?.data;

      if (aData && bData) {
        // parsed account structure: { parsed: { info: { tokenAmount: { amount, decimals } }}}
        const aAmtStr = aData.parsed?.info?.tokenAmount?.amount;
        const bAmtStr = bData.parsed?.info?.tokenAmount?.amount;

        const aAmt = aAmtStr ? BigInt(aAmtStr) : BigInt(0);
        const bAmt = bAmtStr ? BigInt(bAmtStr) : BigInt(0);

        return {
          tokenAReserve: aAmt,
          tokenBReserve: bAmt,
          lpSupply: BigInt(0),
        };
      }
    }
  } catch (err) {
    // fall back to parsing pool account data below
    console.warn('Failed to read vault balances:', err);
  }

  // Fallback: attempt to parse pool account bytes if layout is known
  const ai = await connection.getAccountInfo(pool);
  if (!ai) return null;
  const data = ai.data;
  if (data.length < 187) return null;

  try {
    const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
    const tokenAReserve = dv.getBigUint64(163, true);
    const tokenBReserve = dv.getBigUint64(171, true);
    const lpSupply = dv.getBigUint64(179, true);
    return { tokenAReserve, tokenBReserve, lpSupply };
  } catch (err) {
    console.warn('Failed to parse pool reserves:', err);
    return null;
  }
}

// Heuristic discovery: scan the pool account data for 32-byte sequences that point to SPL token accounts
export async function discoverVaultsFromPoolAccount(connection: Connection, pool: PublicKey, maxChecks = 24): Promise<PublicKey[]> {
  const ai = await connection.getAccountInfo(pool);
  if (!ai) return [];
  const data = ai.data;
  const length = data.length;
  const results: PublicKey[] = [];

  // We'll sample offsets evenly across the data to limit RPC calls
  const step = Math.max(4, Math.floor((length - 32) / maxChecks));
  const offsets: number[] = [];
  for (let off = 0; off <= length - 32; off += step) offsets.push(off);

  // Limit concurrent probes
  const checks = offsets.slice(0, maxChecks);
  for (const off of checks) {
    try {
      const slice = data.slice(off, off + 32);
      if (slice.length !== 32) continue;
      const pub = new PublicKey(slice);
      const acct = await connection.getAccountInfo(pub);
      if (!acct) continue;
      // check if owner is TOKEN_PROGRAM_ID
      if (acct.owner.equals(TOKEN_PROGRAM_ID)) {
        results.push(pub);
        if (results.length >= 2) break;
      }
    } catch (err) {
      // ignore invalid pubkeys or RPC errors
    }
  }

  return results;
}

// Estimate the transaction fee by compiling the message and asking the RPC
export async function estimateTransactionFee(connection: Connection, tx: Transaction, payer: PublicKey): Promise<number | null> {
  try {
    const latest = await connection.getLatestBlockhash();
    tx.recentBlockhash = latest.blockhash;
    tx.feePayer = payer;
    const message = tx.compileMessage();
    // getFeeForMessage returns { value: number | null }
    // @ts-ignore - ensure compatibility with different web3 versions
    const feeResp = await (connection as any).getFeeForMessage(message);
    const fee = feeResp?.value ?? null;
    return typeof fee === 'number' ? fee : null;
  } catch (err) {
    console.warn('Failed to estimate fee:', err);
    return null;
  }
}

export default {};
