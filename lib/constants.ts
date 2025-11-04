// Program configuration
export const PROGRAM_ID = process.env.NEXT_PUBLIC_PROGRAM_ID || '9HiX1zn36tRsmqJp2F1sGFNVFimoVcbe9JMGSUo9LsiV';
export const NETWORK = process.env.NEXT_PUBLIC_NETWORK || 'devnet';
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com';

// RedzExchange instruction types
export enum RedzInstruction {
  InitializeConfig = 0,
  CreatePool = 1,
  AddLiquidity = 2,
  RemoveLiquidity = 3,
  Swap = 4,
  LaunchToken = 5,
  ParticipateInLaunch = 6,
  FinalizeTokenLaunch = 7,
  CloseTokenLaunch = 8,
  WithdrawFees = 9,
  UpdateConfig = 10,
}

// Pool state structure
export interface PoolState {
  isInitialized: boolean;
  tokenAMint: string;
  tokenBMint: string;
  tokenAVault: string;
  tokenBVault: string;
  lpTokenMint: string;
  feeRate: number;
  tokenAReserve: number;
  tokenBReserve: number;
  lpTokenSupply: number;
}

// Launch state structure
export interface LaunchState {
  isInitialized: boolean;
  tokenMint: string;
  launcher: string;
  targetAmount: number;
  currentAmount: number;
  tokenAmount: number;
  duration: number;
  launchTime: number;
  isFinalized: boolean;
  isClosed: boolean;
}

// Token info structure
export interface TokenInfo {
  mint: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

// Popular tokens - mainnet addresses
export const POPULAR_TOKENS: TokenInfo[] = [
  {
    mint: 'So11111111111111111111111111111111111111112', // Wrapped SOL (same on all networks)
    symbol: 'SOL',
    name: 'Wrapped SOL',
    decimals: 9,
    logoURI: '/solana-logo.png'
  },
  {
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC mainnet
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    logoURI: '/usdc-logo.png'
  },
  {
    mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT mainnet
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    logoURI: '/usdt-logo.png'
  }
];

// App configuration
export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'RedzExchange',
  description: 'Advanced DeFi Protocol on Solana',
  version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  author: 'RedzExchange Team',
  network: NETWORK,
  social: {
    twitter: process.env.NEXT_PUBLIC_TWITTER_URL || 'https://twitter.com/redzexchange',
    discord: process.env.NEXT_PUBLIC_DISCORD_URL || 'https://discord.gg/redzexchange',
    github: process.env.NEXT_PUBLIC_GITHUB_URL || 'https://github.com/redzexchange'
  }
};