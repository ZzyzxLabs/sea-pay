#!/bin/bash

# Test script for the ERC-3009 and Solana relayer service
# Usage: ./test-relay.sh [chain] [network]
#
# Arguments:
#   chain   - Chain to test (ethereum|base|polygon|solana). Defaults to base if not specified.
#   network - Network to test (testnet|mainnet|devnet). Defaults to testnet if not specified.
#             For Solana, use "devnet" (default) or "mainnet"
#
# Environment variables (EVM chains):
#   FROM_PK - Private key of the sender (required for EVM chains)
#   RELAY_BASE_URL - Base URL of the relayer (default: http://localhost:3001)
#   TO_ADDRESS - Recipient address (optional)
#   VALUE - Amount in smallest unit (optional)
#
# Environment variables (Solana):
#   SOLANA_TEST_SENDER_SECRET - Base58 encoded secret key of sender (required)
#   SOLANA_TEST_RECIPIENT - Recipient public key (required)
#   SOLANA_SPL_MINT - SPL token mint address (required)
#   SOLANA_SPL_AMOUNT - Token amount in smallest unit (required)
#   SOLANA_RPC_URL - Solana RPC URL (optional, defaults to devnet)
#   SOLANA_RELAY_URL - Relay endpoint URL (optional, defaults to http://localhost:3001/solana/relay)

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
# Default to testnet if network not specified (or devnet for Solana)
NETWORK=${2:-testnet}
NETWORK=$(echo "$NETWORK" | tr '[:upper:]' '[:lower:]')

# Determine test file based on chain and network
case "$CHAIN" in
  ethereum|eth)
    if [ "$NETWORK" = "mainnet" ]; then
      TEST_FILE="test/test-ethereum-mainnet-relay.mjs"
      CHAIN_NAME="Ethereum Mainnet"
      REQUIRES_FROM_PK=true
    else
      TEST_FILE="test/test-ethereum-sepolia-relay.mjs"
      CHAIN_NAME="Ethereum Sepolia"
      REQUIRES_FROM_PK=true
    fi
    ;;
  base)
    if [ "$NETWORK" = "mainnet" ]; then
      TEST_FILE="test/test-base-mainnet-relay.mjs"
      CHAIN_NAME="Base Mainnet"
      REQUIRES_FROM_PK=true
    else
      TEST_FILE="test/test-base-sepolia-relay.mjs"
      CHAIN_NAME="Base Sepolia"
      REQUIRES_FROM_PK=true
    fi
    ;;
  polygon)
    if [ "$NETWORK" = "mainnet" ]; then
      TEST_FILE="test/test-polygon-mainnet-relay.mjs"
      CHAIN_NAME="Polygon Mainnet"
      REQUIRES_FROM_PK=true
    else
      TEST_FILE="test/test-polygon-amoy-relay.mjs"
      CHAIN_NAME="Polygon Amoy"
      REQUIRES_FROM_PK=true
    fi
    ;;
  solana|sol)
    TEST_FILE="test/test-solana-devnet.mjs"
    if [ "$NETWORK" = "mainnet" ]; then
      CHAIN_NAME="Solana Mainnet"
    else
      CHAIN_NAME="Solana Devnet"
    fi
    REQUIRES_FROM_PK=false
    ;;
  *)
    echo "❌ Error: Unknown chain '$CHAIN'"
    echo ""
    echo "Usage: ./test-relay.sh [chain] [network]"
    echo ""
    echo "Supported chains:"
    echo "  ethereum, eth - Ethereum network"
    echo "  base          - Base network"
    echo "  polygon      - Polygon network"
    echo "  solana, sol   - Solana network"
    echo ""
    echo "Supported networks:"
    echo "  testnet  - Testnet (default for EVM chains)"
    echo "  mainnet  - Mainnet"
    echo "  devnet   - Devnet (default for Solana)"
    echo ""
    echo "Examples:"
    echo "  ./test-relay.sh ethereum testnet  # Ethereum Sepolia"
    echo "  ./test-relay.sh ethereum mainnet  # Ethereum Mainnet"
    echo "  ./test-relay.sh base testnet      # Base Sepolia (default)"
    echo "  ./test-relay.sh base mainnet      # Base Mainnet"
    echo "  ./test-relay.sh polygon testnet   # Polygon Amoy"
    echo "  ./test-relay.sh polygon mainnet   # Polygon Mainnet"
    echo "  ./test-relay.sh solana devnet     # Solana Devnet (SPL token transfer)"
    echo "  ./test-relay.sh solana mainnet    # Solana Mainnet (SPL token transfer)"
    exit 1
    ;;
esac

# Use environment variables with defaults
RELAY_BASE_URL=${RELAY_BASE_URL:-http://localhost:3001}

# Validate required environment variables based on chain type
if [ "$REQUIRES_FROM_PK" = "true" ]; then
  if [ -z "$FROM_PK" ]; then
    echo "❌ Error: FROM_PK environment variable is required for $CHAIN_NAME"
    echo ""
    echo "Usage: FROM_PK=0xYourPrivateKey ./test-relay.sh [chain] [network]"
    echo ""
    echo "Examples:"
    echo "  FROM_PK=0xYourPrivateKey ./test-relay.sh ethereum testnet"
    echo "  FROM_PK=0xYourPrivateKey ./test-relay.sh ethereum mainnet"
    echo "  FROM_PK=0xYourPrivateKey ./test-relay.sh base testnet"
    echo "  FROM_PK=0xYourPrivateKey ./test-relay.sh base mainnet"
    echo "  FROM_PK=0xYourPrivateKey ./test-relay.sh polygon testnet"
    echo "  FROM_PK=0xYourPrivateKey ./test-relay.sh polygon mainnet"
    exit 1
  fi
else
  # Solana requires different env vars
  if [ -z "$SOLANA_TEST_SENDER_SECRET" ]; then
    echo "❌ Error: SOLANA_TEST_SENDER_SECRET environment variable is required for Solana"
    echo ""
    echo "Usage: SOLANA_TEST_SENDER_SECRET=<base58_secret> SOLANA_TEST_RECIPIENT=<pubkey> SOLANA_SPL_MINT=<mint> SOLANA_SPL_AMOUNT=<amount> ./test-relay.sh solana [devnet|mainnet]"
    echo ""
    echo "Required environment variables for Solana:"
    echo "  SOLANA_TEST_SENDER_SECRET - Base58 encoded secret key of sender"
    echo "  SOLANA_TEST_RECIPIENT     - Recipient public key"
    echo "  SOLANA_SPL_MINT           - SPL token mint address"
    echo "  SOLANA_SPL_AMOUNT         - Token amount in smallest unit"
    echo ""
    echo "Optional:"
    echo "  SOLANA_RPC_URL            - Solana RPC URL (defaults to devnet)"
    echo "  SOLANA_RELAY_URL          - Relay endpoint (defaults to http://localhost:3001/solana/relay)"
    echo ""
    echo "Example:"
    echo "  SOLANA_TEST_SENDER_SECRET=... SOLANA_TEST_RECIPIENT=... SOLANA_SPL_MINT=... SOLANA_SPL_AMOUNT=1000000 ./test-relay.sh solana devnet"
    exit 1
  fi
  if [ -z "$SOLANA_TEST_RECIPIENT" ]; then
    echo "❌ Error: SOLANA_TEST_RECIPIENT environment variable is required for Solana"
    exit 1
  fi
  if [ -z "$SOLANA_SPL_MINT" ]; then
    echo "❌ Error: SOLANA_SPL_MINT environment variable is required for Solana"
    exit 1
  fi
  if [ -z "$SOLANA_SPL_AMOUNT" ]; then
    echo "❌ Error: SOLANA_SPL_AMOUNT environment variable is required for Solana"
    exit 1
  fi
fi

if [ "$REQUIRES_FROM_PK" = "true" ]; then
  echo "🧪 Testing ERC-3009 Relayer Service"
else
  echo "🧪 Testing Solana SPL Token Relayer Service"
fi
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
if [ "$REQUIRES_FROM_PK" = "true" ]; then
  echo "2. Running ERC-3009 relay test for $CHAIN_NAME..."
else
  echo "2. Running Solana SPL token relay test for $CHAIN_NAME..."
fi
echo ""

cd "$SCRIPT_DIR"
node "$TEST_FILE"
