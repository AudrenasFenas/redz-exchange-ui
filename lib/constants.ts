// Program configuration
export const PROGRAM_ID = process.env.NEXT_PUBLIC_PROGRAM_ID || '9HiX1zn36tRsmqJp2F1sGFNVFimoVcbe9JMGSUo9LsiV';
export const NETWORK = process.env.NEXT_PUBLIC_NETWORK || 'mainnet';

// RPC URL Configuration with fallbacks
// Build Alchemy URLs from env when provided. NEVER commit your real API key to the repo.
const ALCHEMY_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || '';
const ALCHEMY_MAINNET = ALCHEMY_KEY
  ? `https://solana-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`
  : 'https://solana-mainnet.g.alchemy.com/v2/demo';
const ALCHEMY_DEVNET = ALCHEMY_KEY
  ? `https://solana-devnet.g.alchemy.com/v2/${ALCHEMY_KEY}`
  : 'https://solana-devnet.g.alchemy.com/v2/demo';

export const RPC_ENDPOINTS = {
  mainnet: [
    // Primary high-performance RPC endpoints
    'https://solana-api.projectserum.com',
    'https://rpc.ankr.com/solana',
    ALCHEMY_MAINNET,
    'https://api.mainnet-beta.solana.com',
    // GenesysGo (Premium)
    'https://ssc-dao.genesysgo.net',
    // Triton (Fast)
    'https://solana-mainnet.phantom.tech',
    // QuickNode (Reliable)
    'https://api.quicknode.com/solana',
  ],
  devnet: [
    'https://api.devnet.solana.com',
    'https://rpc.ankr.com/solana_devnet',
    ALCHEMY_DEVNET,
  ],
  testnet: [
    'https://api.testnet.solana.com',
    'https://rpc.ankr.com/solana_testnet',
  ]
};

// Get primary RPC URL based on network
export const getRpcUrl = (network: string = NETWORK): string => {
  const endpoints = RPC_ENDPOINTS[network as keyof typeof RPC_ENDPOINTS];
  return endpoints?.[0] || RPC_ENDPOINTS.mainnet[0];
};

// Use environment variable or get default RPC URL
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || getRpcUrl(NETWORK);

// RPC Configuration with retry logic
export const RPC_CONFIG = {
  commitment: 'confirmed' as const,
  timeout: 30000,
  retryCount: 3,
  retryDelay: 1000,
};

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
    // use local svg assets in public/logos
    logoURI: '/logos/solana.svg'
  },
  {
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC mainnet
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    logoURI: '/logos/usdc.svg'
  },
  {
    mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT mainnet
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    logoURI: '/logos/usdt.svg'
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

// Feature flags / integrations
export const APP_FEATURES = {
  enableLocalWalletGeneration: (process.env.NEXT_PUBLIC_ENABLE_LOCAL_WALLET_GENERATION || '').toLowerCase() === 'true',
  enableQrCode: (process.env.NEXT_PUBLIC_ENABLE_QR || 'true').toLowerCase() !== 'false',
  onramp: {
    moonpayUrl: process.env.NEXT_PUBLIC_ONRAMP_MOONPAY_URL || '',
    transakUrl: process.env.NEXT_PUBLIC_ONRAMP_TRANSAK_URL || '',
    rampUrl: process.env.NEXT_PUBLIC_ONRAMP_RAMP_URL || '',
  },
};