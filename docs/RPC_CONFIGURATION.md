# RPC Configuration Guide

This guide explains how to configure and optimize RPC endpoints for RedzExchange.

## 🚀 Quick Start

### Option 1: Use the RPC Generator (Recommended)
```bash
npm run rpc:generate
```

This will:
- Test all available RPC endpoints
- Find the fastest one
- Generate an optimized `.env.local` file

### Option 2: Manual Configuration
Copy `.env.template` to `.env.local` and customize:
```bash
cp .env.template .env.local
```

## 📊 RPC Endpoint Categories

### 🆓 Free Public Endpoints
- **Solana Labs**: `https://api.mainnet-beta.solana.com`
  - Rate limited but reliable
  - Good for development and testing
  
- **Ankr**: `https://rpc.ankr.com/solana`
  - Fast and reliable
  - Good for production with light usage
  
- **Project Serum**: `https://solana-api.projectserum.com`
  - Community-maintained
  - Variable performance

### 💎 Premium Endpoints (Recommended for Production)

#### Alchemy
- **URL**: `https://solana-mainnet.g.alchemy.com/v2/YOUR_API_KEY`
- **Features**: High reliability, detailed analytics
- **Pricing**: Free tier available
- **Sign up**: [alchemy.com](https://alchemy.com)

#### QuickNode
- **URL**: `https://YOUR_ENDPOINT.quiknode.pro/YOUR_API_KEY`
- **Features**: Global edge network, 99.9% uptime
- **Pricing**: Pay per request or monthly plans
- **Sign up**: [quicknode.com](https://quicknode.com)

#### Helius
- **URL**: `https://rpc.helius.xyz/?api-key=YOUR_API_KEY`
- **Features**: Enhanced RPC with webhooks
- **Pricing**: Free tier available
- **Sign up**: [helius.xyz](https://helius.xyz)

#### GenesysGo
- **URL**: `https://ssc-dao.genesysgo.net`
- **Features**: High-performance infrastructure
- **Pricing**: Various tiers available
- **Sign up**: [genesysgo.com](https://genesysgo.com)

## ⚡ Performance Optimization

### Connection Manager Features
Our RPC connection manager provides:

1. **Automatic Failover**: Switches to backup endpoints on failure
2. **Connection Pooling**: Reuses connections for better performance
3. **Latency Testing**: Finds the fastest endpoint
4. **Retry Logic**: Automatically retries failed requests

### Usage Example
```typescript
import { getConnectionWithRetry, rpcManager } from '@/lib/rpc';

// Get connection with automatic retry and failover
const connection = await getConnectionWithRetry();

// Find fastest endpoint
const fastestEndpoint = await rpcManager.findFastestEndpoint();

// Test all endpoints
const statuses = await rpcManager.getAllEndpointStatuses();
```

## 🔧 Configuration Options

### Environment Variables
```bash
# Primary RPC endpoint
NEXT_PUBLIC_RPC_URL=https://your-rpc-endpoint.com

# Network (mainnet/devnet/testnet)
NEXT_PUBLIC_NETWORK=mainnet

# Performance settings
NEXT_PUBLIC_RPC_TIMEOUT=30000
NEXT_PUBLIC_RPC_FAILOVER=true
NEXT_PUBLIC_RPC_POOLING=true
```

### Programmatic Configuration
```typescript
import { RpcConnectionManager } from '@/lib/rpc';

const rpcManager = new RpcConnectionManager('mainnet');
const connection = rpcManager.getConnection();
```

## 🛠 Testing RPC Endpoints

### Command Line Testing
```bash
# Test all endpoints
npm run rpc:generate

# Test specific endpoint
curl -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}' \
  https://api.mainnet-beta.solana.com
```

### Programmatic Testing
```typescript
import { rpcManager } from '@/lib/rpc';

// Test single endpoint
const result = await rpcManager.testConnection('https://api.mainnet-beta.solana.com');
console.log(`Success: ${result.success}, Latency: ${result.latency}ms`);

// Test all endpoints
const statuses = await rpcManager.getAllEndpointStatuses();
statuses.forEach(status => {
  console.log(`${status.endpoint}: ${status.success ? 'OK' : 'FAILED'} (${status.latency}ms)`);
});
```

## 🚨 Troubleshooting

### Common Issues

#### Rate Limiting
- **Symptom**: 429 HTTP errors
- **Solution**: Switch to premium endpoint or implement request throttling

#### Network Timeouts
- **Symptom**: Connection timeout errors
- **Solution**: Increase `NEXT_PUBLIC_RPC_TIMEOUT` or switch endpoint

#### CORS Issues (Development)
- **Symptom**: CORS errors in browser
- **Solution**: Use Next.js API routes as proxy or configure CORS headers

### Debugging
```typescript
import { rpcManager } from '@/lib/rpc';

// Enable debug logging
rpcManager.resetConnections();
const connection = rpcManager.getConnection();

// Test connection
try {
  const blockHeight = await connection.getBlockHeight();
  console.log('Connection successful, block height:', blockHeight);
} catch (error) {
  console.error('Connection failed:', error);
  // Automatic failover
  const backupConnection = rpcManager.failover();
}
```

## 📈 Best Practices

### For Development
- Use free public endpoints
- Enable failover for reliability
- Test different endpoints to find the best one

### For Production
- Use premium endpoints with API keys
- Implement proper error handling
- Monitor RPC performance and costs
- Set up backup endpoints

### For High-Traffic Applications
- Use multiple premium endpoints
- Implement connection pooling
- Monitor rate limits
- Consider running your own RPC node

## 🔗 Useful Links

- [Solana RPC API Documentation](https://docs.solana.com/api)
- [Solana Cluster RPC Endpoints](https://docs.solana.com/cluster/rpc-endpoints)
- [Alchemy Solana Documentation](https://docs.alchemy.com/reference/solana-api-quickstart)
- [QuickNode Solana Guide](https://www.quicknode.com/guides/solana-development)

## 📊 Endpoint Comparison

| Provider | Free Tier | Rate Limits | Global CDN | Analytics | Support |
|----------|-----------|-------------|------------|-----------|---------|
| Solana Labs | ✅ | High | ❌ | ❌ | Community |
| Alchemy | ✅ | Medium | ✅ | ✅ | Premium |
| QuickNode | ❌ | Low | ✅ | ✅ | Premium |
| Helius | ✅ | Medium | ✅ | ✅ | Premium |
| Ankr | ✅ | Medium | ✅ | ❌ | Community |

Choose the endpoint that best fits your application's needs and budget.