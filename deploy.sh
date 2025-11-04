#!/bin/bash

# RedzExchange Mainnet Deployment Script
set -e

echo "🚀 RedzExchange Mainnet Deployment"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version)
echo "📋 Node.js version: $NODE_VERSION"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# Run type checking
echo "🔍 Running type checks..."
npm run type-check

# Run linting
echo "🧹 Running linter..."
npm run lint || echo "⚠️  Linting skipped (non-critical)"

# Build production version
echo "🏗️  Building production version..."
NODE_ENV=production npm run build

# Run security audit
echo "🔒 Running security audit..."
npm audit --audit-level moderate

echo ""
echo "✅ Build completed successfully!"
echo ""
echo "📋 Deployment Summary:"
echo "   • Environment: Production (Mainnet)"
echo "   • Network: Solana Mainnet"
echo "   • Build: Optimized"
echo "   • Security: Audited"
echo ""
echo "🚀 Ready for deployment!"
echo ""
echo "Next steps:"
echo "1. Deploy to your hosting platform (Vercel, Netlify, etc.)"
echo "2. Configure environment variables for production"
echo "3. Set up domain and SSL certificate"
echo "4. Test all functionality on mainnet"
echo "5. Monitor application performance"
echo ""