#!/bin/bash

# Test script for the ERC-3009 relayer service
# Usage: ./test-relay.sh

set -e

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

# 2. Get token domain
echo "2. Fetching token domain..."
DOMAIN=$(curl -s "$RELAY_BASE_URL/api/tokenDomain?token=$TOKEN")
echo "Domain: $DOMAIN"
echo ""

# 3. Note: Full relay test requires signing with ethers.js
# This is a placeholder - you'll need to implement the signing logic
echo "3. To test relay endpoint, you need to:"
echo "   - Sign a TransferWithAuthorization message using ethers.js"
echo "   - Send the signed message to POST $RELAY_BASE_URL/api/relay"
echo ""
echo "See the @seapay-ai/erc3009 package for signing utilities."

