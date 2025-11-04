# RedzExchange UI

Advanced DeFi Protocol on Solana - Production-Ready Frontend

[![Deploy to Production](https://github.com/AudrenasFenas/redz-exchange-ui/actions/workflows/deploy.yml/badge.svg)](https://github.com/AudrenasFenas/redz-exchange-ui/actions/workflows/deploy.yml)

🔗 **Live Demo**: [https://redz-exchange-ui.vercel.app](https://redz-exchange-ui.vercel.app)

## 🚀 Features

- **Swap Interface**: Trade tokens with optimal pricing
- **Pool Interface**: Add/remove liquidity from trading pools  
- **Launch Interface**: Create and participate in token launches
- **Wallet Integration**: Support for Phantom, Solflare, and other Solana wallets
- **Mainnet Ready**: Production-optimized for Solana mainnet

## 🛠 Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Blockchain**: Solana Web3.js
- **Wallet**: Solana Wallet Adapter
- **Deployment**: Vercel with GitHub Actions CI/CD

## 📦 Deployment

### Automatic Deployment

This project is configured for automatic deployment:

1. **GitHub**: Push to `main` branch triggers deployment
2. **Vercel**: Automatically deploys via GitHub integration
3. **CI/CD**: GitHub Actions runs tests and builds

### Manual Deployment

```bash
# Build and deploy locally
npm run build:prod
./deploy.sh

# Or deploy to Vercel
npm i -g vercel
vercel --prod
```

### Environment Variables

Configure these in your deployment platform:

```env
NEXT_PUBLIC_NETWORK=mainnet
NEXT_PUBLIC_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_PROGRAM_ID=9HiX1zn36tRsmqJp2F1sGFNVFimoVcbe9JMGSUo9LsiV
NEXT_PUBLIC_APP_NAME=RedzExchange
NEXT_PUBLIC_APP_VERSION=1.0.0
# Optional: override default APIs
NEXT_PUBLIC_PRICE_API=https://price.jup.ag/v6/price
NEXT_PUBLIC_TOKEN_LIST_URL=https://token.jup.ag/all

# Optional: Top-up and features
NEXT_PUBLIC_ENABLE_QR=true
# Show advanced local wallet generation (NOT recommended for production)
NEXT_PUBLIC_ENABLE_LOCAL_WALLET_GENERATION=false
# Optional on-ramp provider URLs (include your API keys and params if required)
# Example (append address as query param):
# NEXT_PUBLIC_ONRAMP_MOONPAY_URL=https://buy.moonpay.com?apiKey=YOUR_KEY
# NEXT_PUBLIC_ONRAMP_TRANSAK_URL=https://global.transak.com?apiKey=YOUR_KEY
# NEXT_PUBLIC_ONRAMP_RAMP_URL=https://buy.ramp.network?hostApiKey=YOUR_KEY
```

## 📡 Live Prices & Token Metadata

- Real-time prices powered by Jupiter Price API (polled every 15s)
- Token metadata (symbol, name, logo) from Jupiter Token List
- Components and hooks:
   - `usePrices(mints, intervalMs)` from `lib/prices`
   - `useTokenList()` from `lib/tokens`
   - `PriceTicker` shows live prices in the navbar
   - `TokenSelector` provides searchable token selection in the swap UI

   ## 💰 Balances and Top-up

   - `BalancesPanel` shows your SOL and tracked token balances with USD values
   - `TopUpModal` lets users copy deposit address, scan a QR, and open optional on-ramp links
   - If disconnected, prompts to connect the wallet; optional advanced local address generation (guarded by env flag)

## 📦 Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd redz-exchange-ui

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

## 🔧 Environment Configuration

### Development (.env.local)
```bash
NEXT_PUBLIC_NETWORK=devnet
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=9HiX1zn36tRsmqJp2F1sGFNVFimoVcbe9JMGSUo9LsiV
```

### Production (.env.production)
```bash
NEXT_PUBLIC_NETWORK=mainnet
NEXT_PUBLIC_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_PROGRAM_ID=9HiX1zn36tRsmqJp2F1sGFNVFimoVcbe9JMGSUo9LsiV
```

## 🏗 Development

```bash
# Start development server
npm run dev

# Type checking
npm run type-check

# Linting
# Linting
npm run lint          # Check for linting errors
npm run lint:fix      # Auto-fix linting issues
```

## 🚀 Production Build

```bash
# Build for production
npm run build:prod

# Start production server
npm run start:prod

# Analyze bundle size
ANALYZE=true npm run build
```

## 📱 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_NETWORK=mainnet`
   - `NEXT_PUBLIC_RPC_URL=https://api.mainnet-beta.solana.com`
   - `NEXT_PUBLIC_PROGRAM_ID=9HiX1zn36tRsmqJp2F1sGFNVFimoVcbe9JMGSUo9LsiV`
3. Deploy automatically on push to main branch

### Alternative Deployments

- **Netlify**: Use `npm run build && npm run export`
- **AWS S3**: Static export with CloudFront
- **Self-hosted**: Use `npm run build && npm run start:prod`

## 🔒 Security Features

- Content Security Policy headers
- XSS protection
- HTTPS enforcement
- Frame options protection
- Secure wallet connections

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# E2E tests (when implemented)  
npm run test:e2e
```

## 📊 Performance

- Optimized bundle size
- Image optimization
- Static generation where possible
- Efficient wallet connections
- Minimal re-renders

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- [Website](https://redzexchange.com)
- [Twitter](https://twitter.com/redzexchange)
- [Discord](https://discord.gg/redzexchange)
- [GitHub](https://github.com/redzexchange)

## ⚠️ Mainnet Deployment Checklist

- [x] Environment variables configured for mainnet
- [x] RPC endpoints updated to mainnet
- [x] Program ID verified for mainnet
- [x] Token addresses updated to mainnet
- [x] Security headers implemented
- [x] Production build optimized
- [x] Bundle size analyzed
- [ ] Smart contract deployed to mainnet
- [ ] Liquidity pools initialized
- [ ] Frontend tested on mainnet
- [ ] Domain configured and SSL enabled
- [ ] Monitoring and analytics setup