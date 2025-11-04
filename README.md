# RedzExchange UI

Advanced DeFi Protocol on Solana - Production-Ready Frontend

## 🚀 Features

- **Swap Interface**: Trade tokens with optimal pricing
- **Pool Interface**: Add/remove liquidity from trading pools  
- **Launch Interface**: Create and participate in token launches
- **Wallet Integration**: Support for Phantom, Solflare, and other Solana wallets
- **Mainnet Ready**: Production-optimized for Solana mainnet

## 🛠 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Blockchain**: Solana Web3.js
- **Wallet**: Solana Wallet Adapter

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