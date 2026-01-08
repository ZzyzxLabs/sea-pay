#!/bin/bash

# Test script for the ERC-3009 relayer service
# Usage: ./test-relay.sh

set -e

# Load root .env file if it exists (monorepo root is two levels up)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_ENV="${SCRIPT_DIR}/../../.env"
if [ -f "$ROOT_ENV" ]; then
  set -a
  source "$ROOT_ENV"
  set +a
fi

# Use environment variables with defaults
RELAY_BASE_URL=${RELAY_BASE_URL:-http://localhost:3001}
TOKEN=${TOKEN:-"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"}  # USDC on Ethereum
TO=${TO:-"0x8ba1f109551bD432803012645Hac136c22C3e0"}
VALUE=${VALUE:-"1000000"}  # 1 USDC (6 decimals)
FROM_PK=${FROM_PK:-""}

if [ -z "$FROM_PK" ]; then
  echo "Error: FROM_PK environment variable is required"
  echo "Usage: FROM_PK=0xYourPrivateKey ./test-relay.sh"
  exit 1
fi

echo "Testing ERC-3009 Relayer Service"
echo "Relay URL: $RELAY_BASE_URL"
echo "Token: $TOKEN"
echo "To: $TO"
echo "Value: $VALUE"
echo ""

# 1. Health check
echo "1. Checking health..."
HEALTH=$(curl -s "$RELAY_BASE_URL/health")
echo "Response: $HEALTH"
echo ""

# 2. Full relay test (requires Node.js and ethers.js)
echo "2. Running full relay test..."
echo ""

# Check if Node.js is available
if ! command -v node &> /dev/null; then
  echo "⚠️  Node.js is not installed. Skipping relay test."
  echo "   To run the full relay test, install Node.js and run:"
  echo "   node test-relay.mjs"
  echo ""
  echo "   Or use pnpm:"
  echo "   pnpm --filter @seapay/relayer-service test"
  exit 0
fi

# Run the Node.js test script with the same environment variables
echo "Running Node.js relay test..."
node test-relay.mjs

