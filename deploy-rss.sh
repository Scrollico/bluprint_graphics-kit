#!/bin/bash

# Scrolli RSS Worker Deployment Script
# This script deploys the RSS worker to Cloudflare Workers

echo "🚀 Deploying Scrolli RSS Worker to Cloudflare..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Please install it first:"
    echo "   npm install -g wrangler"
    echo "   or"
    echo "   pnpm add -g wrangler"
    exit 1
fi

# Check if user is logged in
if ! wrangler whoami &> /dev/null; then
    echo "❌ Not logged in to Cloudflare. Please run:"
    echo "   wrangler login"
    exit 1
fi

# Test the worker locally first
echo "🧪 Testing worker locally..."
if node test-scrolli-rss.js; then
    echo "✅ Local test passed!"
else
    echo "❌ Local test failed. Please fix issues before deploying."
    exit 1
fi

# Deploy to Cloudflare Workers
echo "📦 Deploying to Cloudflare Workers..."
if wrangler deploy; then
    echo "✅ Deployment successful!"
    echo ""
    echo "🎉 Your RSS feed is now live!"
    echo "📡 RSS URL: https://scrolli-rss-feed.your-subdomain.workers.dev"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Test your RSS feed in a reader (Feedly, Inoreader, etc.)"
    echo "   2. Set up monitoring for the worker"
    echo "   3. Configure custom domain if needed"
    echo ""
    echo "🔧 Useful commands:"
    echo "   wrangler tail          # View live logs"
    echo "   wrangler dev           # Local development"
    echo "   wrangler whoami        # Check account"
else
    echo "❌ Deployment failed. Check the error messages above."
    exit 1
fi

