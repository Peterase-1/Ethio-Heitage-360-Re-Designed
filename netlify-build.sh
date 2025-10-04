#!/bin/bash

# Netlify Build Script for EthioHeritage360
# This script handles common build issues and ensures successful deployment

echo "🚀 Starting EthioHeritage360 Netlify Build"
echo "=========================================="

# Set error handling
set -e

# Print Node and NPM versions
echo "📊 Environment Info:"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Current directory: $(pwd)"

# Check if client directory exists
if [ ! -d "client" ]; then
  echo "❌ Error: client directory not found"
  exit 1
fi

echo "📁 Client directory found"

# Navigate to client directory
cd client

# Check if package.json exists
if [ ! -f "package.json" ]; then
  echo "❌ Error: client/package.json not found"
  exit 1
fi

echo "📦 package.json found"

# Clean install dependencies
echo "🔄 Installing client dependencies..."
if npm ci --production=false; then
  echo "✅ Dependencies installed successfully"
else
  echo "⚠️ npm ci failed, trying npm install..."
  npm install
fi

# Build the client
echo "🏗️ Building client application..."
if npm run build; then
  echo "✅ Client build completed successfully"
else
  echo "❌ Client build failed"
  exit 1
fi

# Check if dist directory was created
if [ ! -d "dist" ]; then
  echo "❌ Error: dist directory not created"
  exit 1
fi

echo "📂 Build artifacts created in dist directory"

# List contents of dist directory
echo "📋 Build artifacts:"
ls -la dist/

# Check for required files
if [ -f "dist/index.html" ]; then
  echo "✅ index.html found"
else
  echo "❌ Error: index.html not found in dist"
  exit 1
fi

echo "🎉 Netlify build completed successfully!"
echo "Build artifacts are ready in client/dist"
