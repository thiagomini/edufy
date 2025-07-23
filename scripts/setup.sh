#!/bin/bash

# Development Environment Setup Script for Edufy
# This script helps developers set up the correct Node.js and pnpm versions

echo "🚀 Setting up Edufy development environment..."
echo ""

# Check if fnm is available
if command -v fnm &> /dev/null; then
    echo "✅ fnm found, installing Node.js 22.17.1..."
    fnm install 22.17.1
    fnm use 22.17.1
elif command -v nvm &> /dev/null; then
    echo "✅ nvm found, installing Node.js 22.17.1..."
    nvm install 22.17.1
    nvm use 22.17.1
else
    echo "❌ Neither fnm nor nvm found. Please install one of them first:"
    echo "   - fnm: https://github.com/Schniz/fnm"
    echo "   - nvm: https://github.com/nvm-sh/nvm"
    exit 1
fi

# Verify Node.js version
NODE_VERSION=$(node --version)
if [ "$NODE_VERSION" = "v22.17.1" ]; then
    echo "✅ Node.js version: $NODE_VERSION"
else
    echo "❌ Wrong Node.js version: $NODE_VERSION (expected: v22.17.1)"
    exit 1
fi

# Enable corepack
echo "🔧 Enabling corepack..."
corepack enable

# Verify pnpm version
echo "📦 Setting up pnpm..."
PNPM_VERSION=$(pnpm --version)
if [ "$PNPM_VERSION" = "9.15.0" ]; then
    echo "✅ pnpm version: $PNPM_VERSION"
else
    echo "❌ Wrong pnpm version: $PNPM_VERSION (expected: 9.15.0)"
    exit 1
fi

# Install dependencies
echo "📥 Installing dependencies..."
pnpm install

echo ""
echo "🎉 Environment setup complete!"
echo "   Node.js: $(node --version)"
echo "   pnpm: $(pnpm --version)"
echo ""
echo "You can now run:"
echo "   pnpm run start:dev  # Start development server"
echo "   pnpm test          # Run tests"
