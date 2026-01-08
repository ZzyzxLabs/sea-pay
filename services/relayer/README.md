# ERC-3009 Relayer Service

Service for relaying ERC-3009 (TransferWithAuthorization) transactions, enabling gasless token transfers.

## Features

- ✅ Multi-chain support (Base, Ethereum, Arbitrum, Optimism, Polygon)
- ✅ Token registry integration (USDC pre-configured)
- ✅ EIP-712 signature verification
- ✅ Replay protection via nonce tracking
- ✅ Token allowlist support
- ✅ CORS enabled for web apps
- ✅ Health check endpoint

## Setup

### 1. Install Dependencies

From the monorepo root:

```bash
pnpm install
```

### 2. Environment Variables

Create a `.env` file in the monorepo root with the following variables:

```bash
# Required
RPC_URL=https://sepolia.base.org
RELAYER_PK=0xYourPrivateKey

# Optional
PORT=3001
TOKEN_ALLOWLIST=0x036CbD53842c5426634e7929541eC2318f3dCF7e  # Comma-separated
```

See `env.example` for a complete template with all options.

**Security Note**: Never commit your `.env` file. It contains sensitive private keys.

## Running the Service

### Development Mode

From the monorepo root:

```bash
# Run with hot reload
pnpm --filter @seapay/relayer-service dev

# Or from the service directory
cd services/relayer
pnpm dev
```

The service will start on `http://localhost:3001` (or the port specified in `PORT` env var).

### Production Mode

```bash
# Build
pnpm --filter @seapay/relayer-service build

# Start
pnpm --filter @seapay/relayer-service start
```

## API Endpoints

### 1. Health Check

**GET `/health`**

Returns the service health status and configuration.

```bash
curl http://localhost:3001/health
```

Response:

```json
{
  "ok": true,
  "relayer": "0x...",
  "chainId": 84532
}
```

### 2. Get Token Domain

**GET `/api/tokenDomain?token=<address>`**

Returns the EIP-712 domain for a token. Checks the registry first, then falls back to on-chain queries.

```bash
curl "http://localhost:3001/api/tokenDomain?token=0x036CbD53842c5426634e7929541eC2318f3dCF7e"
```

Response:

```json
{
  "name": "USD Coin",
  "version": "2",
  "chainId": 84532,
  "verifyingContract": "0x036cbd53842c5426634e7929541ec2318f3dcf7e"
}
```

### 3. Relay Transaction

**POST `/base/relay`**

Relays an ERC-3009 TransferWithAuthorization transaction.

Request body:

```json
{
  "token": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  "from": "0x...",
  "to": "0x...",
  "value": "1000000",
  "validAfter": "0",
  "validBefore": "1234567890",
  "nonce": "0x...",
  "signature": "0x...",
  "domain": {
    "name": "USD Coin",
    "version": "2",
    "chainId": 84532,
    "verifyingContract": "0x036CbD53842c5426634e7929541eC2318f3dCF7e"
  }
}
```

Response:

```json
{
  "txHash": "0x...",
  "success": true
}
```

## Testing the Service

### Automated Test Script

The included test script demonstrates the complete flow:

```bash
# Set environment variables
export FROM_PK=0xYourPrivateKey
export TO=0xRecipientAddress
export CHAIN_ID=84532  # Base Sepolia
export TOKEN=USDC
export VALUE=100000    # 0.1 USDC

# Run test (from monorepo root)
pnpm --filter @seapay/relayer-service test

# Or directly
cd services/relayer
node test-relay.mjs
```

The test will:

1. ✅ Check service health
2. ✅ Create a signed ERC-3009 authorization using `@seapay-ai/erc3009`
3. ✅ Verify signature locally
4. ✅ Relay the transaction
5. ✅ Output the transaction hash

### Manual Testing with curl

```bash
# 1. Check health
curl http://localhost:3001/health

# 2. Get token domain
curl "http://localhost:3001/api/tokenDomain?token=0x036CbD53842c5426634e7929541eC2318f3dCF7e"

# 3. Relay transaction (requires proper signature)
curl -X POST http://localhost:3001/base/relay \
  -H "Content-Type: application/json" \
  -d @relay-payload.json
```

## CORS Configuration

The service is configured with CORS to allow requests from:

- `https://seapay.ai`
- `https://app.seapay.ai`
- `https://sea-pay-app.vercel.app`
- Any subdomain of `*.seapay.ai`
- `http://localhost:3000` (development)
- `http://localhost:3001` (development)

Modify the CORS configuration in `src/server.ts` to add more origins.

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "error message",
  "details": "additional context"
}
```

Common errors:

| Error                               | Cause                                |
| ----------------------------------- | ------------------------------------ |
| `missing required fields`           | Request body missing required fields |
| `token not allowed`                 | Token not in allowlist               |
| `domain verifyingContract mismatch` | Domain doesn't match token address   |
| `invalid signature`                 | Signature verification failed        |
| `authorization not yet valid`       | Current time < validAfter            |
| `authorization expired`             | Current time >= validBefore          |
| `nonce already used`                | Replay attack detected               |
| `relay_failed`                      | On-chain transaction failed          |

## Token Registry Integration

The service uses `@seapay-ai/erc3009` which includes a built-in registry for:

- ✅ USDC on Base (mainnet + Sepolia)
- ✅ USDC on Ethereum (mainnet + Sepolia)
- ✅ USDC on Arbitrum (One + Sepolia)
- ✅ USDC on Optimism (mainnet + Sepolia)
- ✅ USDC on Polygon

For tokens in the registry, the `/api/tokenDomain` endpoint returns the correct EIP-712 domain parameters automatically.

## Development

### Project Structure

```
services/relayer/
├── src/
│   └── server.ts          # Main server file
├── test-relay.mjs         # Test script
├── env.example            # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

### TypeScript

The project uses TypeScript. Build output goes to `dist/`.

```bash
# Build
pnpm build

# Type check
pnpm tsc --noEmit
```

### Environment Loading

The service loads environment variables from:

1. `.env` in the current working directory
2. `.env` in the monorepo root (two levels up)

This allows running from either location.

## Security Considerations

### Production Checklist

- [ ] Use a dedicated relayer wallet with limited funds
- [ ] Enable `TOKEN_ALLOWLIST` to restrict which tokens can be relayed
- [ ] Use a secure RPC provider (not public endpoints)
- [ ] Monitor relayer wallet balance
- [ ] Set up alerting for failed transactions
- [ ] Use HTTPS in production
- [ ] Implement rate limiting (not included in this version)
- [ ] Consider adding authentication for API endpoints

### Relayer Wallet

The relayer wallet:

- Pays gas fees for all relayed transactions
- Must have ETH on the target chain
- Should be funded but not over-funded (security)
- Private key should be stored securely (e.g., AWS Secrets Manager, environment variables)

**Recommended**: Start with testnet (Base Sepolia) to test the setup before going to mainnet.

## Troubleshooting

### Port Already in Use

```bash
PORT=3002 pnpm --filter @seapay/relayer-service dev
```

### Missing Environment Variables

Check that `RPC_URL` and `RELAYER_PK` are set:

```bash
echo $RPC_URL
echo $RELAYER_PK
```

### Relayer Out of Gas

The relayer wallet needs ETH to pay gas fees. Check the balance:

```bash
# Using cast (from Foundry)
cast balance $RELAYER_ADDRESS --rpc-url $RPC_URL
```

Get testnet ETH:

- Base Sepolia: [Coinbase Wallet faucet](https://portal.cdp.coinbase.com/products/faucet)
- Ethereum Sepolia: [Alchemy faucet](https://sepoliafaucet.com/)

### CORS Errors

If getting CORS errors from a browser:

1. Check that your origin is in the allowed list
2. Verify CORS middleware is loaded before routes
3. Check browser console for the exact error

### Transaction Fails On-Chain

Common causes:

- Insufficient token balance (sender doesn't have enough tokens)
- Authorization already used (nonce replay)
- Authorization expired (validBefore passed)
- Token doesn't support ERC-3009

Check the transaction on a block explorer for the exact revert reason.

## Related Packages

- [`@seapay-ai/erc3009`](../../packages/erc3009) - ERC-3009 helper library
- [`@seapay/deeplink`](../../packages/deeplink) - DeepLink generator for mobile wallets

## License

Apache-2.0
