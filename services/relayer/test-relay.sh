#!/bin/bash

# Test script for the ERC-3009 relayer service
# Usage: ./test-relay.sh [chain] [network]
#
# Arguments:
#   chain   - Chain to test (base|polygon). Defaults to base if not specified.
#   network - Network to test (testnet|mainnet). Defaults to testnet if not specified.
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

# Parse arguments
# Default to base testnet if not specified
CHAIN=${1:-base}
CHAIN=$(echo "$CHAIN" | tr '[:upper:]' '[:lower:]')
# Default to testnet if network not specified
NETWORK=${2:-testnet}
NETWORK=$(echo "$NETWORK" | tr '[:upper:]' '[:lower:]')

# Determine test file based on chain and network
case "$CHAIN" in
  base)
    if [ "$NETWORK" = "mainnet" ]; then
      TEST_FILE="test/test-base-mainnet-relay.mjs"
      CHAIN_NAME="Base Mainnet"
    else
      TEST_FILE="test/test-base-sepolia-relay.mjs"
      CHAIN_NAME="Base Sepolia"
    fi
    ;;
  polygon)
    if [ "$NETWORK" = "mainnet" ]; then
      TEST_FILE="test/test-polygon-mainnet-relay.mjs"
      CHAIN_NAME="Polygon Mainnet"
    else
      TEST_FILE="test/test-polygon-amoy-relay.mjs"
      CHAIN_NAME="Polygon Amoy"
    fi
    ;;
  *)
    echo "❌ Error: Unknown chain '$CHAIN'"
    echo ""
    echo "Usage: ./test-relay.sh [chain] [network]"
    echo ""
    echo "Supported chains:"
    echo "  base    - Base network"
    echo "  polygon - Polygon network"
    echo ""
    echo "Supported networks:"
    echo "  testnet  - Testnet (default)"
    echo "  mainnet  - Mainnet"
    echo ""
    echo "Examples:"
    echo "  ./test-relay.sh base testnet    # Base Sepolia (default)"
    echo "  ./test-relay.sh base mainnet    # Base Mainnet"
    echo "  ./test-relay.sh polygon testnet # Polygon Amoy"
    echo "  ./test-relay.sh polygon mainnet # Polygon Mainnet"
    exit 1
    ;;
esac

# Use environment variables with defaults
RELAY_BASE_URL=${RELAY_BASE_URL:-http://localhost:3001}

if [ -z "$FROM_PK" ]; then
  echo "❌ Error: FROM_PK environment variable is required"
  echo ""
  echo "Usage: FROM_PK=0xYourPrivateKey ./test-relay.sh [chain] [network]"
  echo ""
  echo "Examples:"
  echo "  FROM_PK=0xYourPrivateKey ./test-relay.sh base testnet"
  echo "  FROM_PK=0xYourPrivateKey ./test-relay.sh base mainnet"
  echo "  FROM_PK=0xYourPrivateKey ./test-relay.sh polygon testnet"
  echo "  FROM_PK=0xYourPrivateKey ./test-relay.sh polygon mainnet"
  exit 1
fi

echo "🧪 Testing ERC-3009 Relayer Service"
echo "Chain: $CHAIN_NAME"
echo "Network: $NETWORK"
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
