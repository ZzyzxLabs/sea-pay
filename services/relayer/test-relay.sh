#!/bin/bash

# Test script for the ERC-3009 relayer service
# Usage: ./test-relay.sh [chain]
#
# Arguments:
#   chain - Chain to test (base|polygon). Defaults to base if not specified.
#
# Environment variables:
#   FROM_PK - Private key of the sender (required)
#   RELAY_BASE_URL - Base URL of the relayer (default: http://localhost:3001)
#   TO_ADDRESS - Recipient address (optional)
#   VALUE - Amount in smallest unit (optional)

set -e

# Load root .env file if it exists (monorepo root is two levels up)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_ENV="${SCRIPT_DIR}/../../.env"
if [ -f "$ROOT_ENV" ]; then
  set -a
  source "$ROOT_ENV"
  set +a
fi

# Parse chain argument
CHAIN=${1:-base}
CHAIN=$(echo "$CHAIN" | tr '[:upper:]' '[:lower:]')

# Determine test file based on chain
case "$CHAIN" in
  base|basesepolia|base-sepolia)
    TEST_FILE="test/test-base-sepolia-relay.mjs"
    CHAIN_NAME="Base Sepolia"
    ;;
  polygon|polygonamoy|polygon-amoy|amoy)
    TEST_FILE="test/test-polygon-relay.mjs"
    CHAIN_NAME="Polygon Amoy"
    ;;
  *)
    echo "❌ Error: Unknown chain '$CHAIN'"
    echo ""
    echo "Usage: ./test-relay.sh [chain]"
    echo ""
    echo "Supported chains:"
    echo "  base, basesepolia, base-sepolia  - Base Sepolia testnet (default)"
    echo "  polygon, polygonamoy, polygon-amoy, amoy  - Polygon Amoy testnet"
    echo ""
    echo "Example:"
    echo "  ./test-relay.sh base"
    echo "  ./test-relay.sh polygon"
    exit 1
    ;;
esac

# Use environment variables with defaults
RELAY_BASE_URL=${RELAY_BASE_URL:-http://localhost:3001}

if [ -z "$FROM_PK" ]; then
  echo "❌ Error: FROM_PK environment variable is required"
  echo ""
  echo "Usage: FROM_PK=0xYourPrivateKey ./test-relay.sh [chain]"
  echo ""
  echo "Example:"
  echo "  FROM_PK=0xYourPrivateKey ./test-relay.sh base"
  echo "  FROM_PK=0xYourPrivateKey ./test-relay.sh polygon"
  exit 1
fi

echo "🧪 Testing ERC-3009 Relayer Service"
echo "Chain: $CHAIN_NAME"
echo "Relay URL: $RELAY_BASE_URL"
echo "Test File: $TEST_FILE"
echo ""

# Check if test file exists
if [ ! -f "$SCRIPT_DIR/$TEST_FILE" ]; then
  echo "❌ Error: Test file not found: $TEST_FILE"
  exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
  echo "❌ Error: Node.js is not installed"
  echo "   Please install Node.js to run the relay test"
  exit 1
fi

# 1. Health check (optional, don't fail if it doesn't work)
echo "1. Checking relayer health..."
if curl -s -f "$RELAY_BASE_URL/health" > /dev/null 2>&1; then
  HEALTH=$(curl -s "$RELAY_BASE_URL/health")
  echo "   ✅ Relayer is healthy: $HEALTH"
else
  echo "   ⚠️  Relayer health check failed (continuing anyway)"
fi
echo ""

# 2. Run the test
echo "2. Running ERC-3009 relay test for $CHAIN_NAME..."
echo ""

cd "$SCRIPT_DIR"
node "$TEST_FILE"
