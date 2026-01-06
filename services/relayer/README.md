# ERC-3009 Relayer Service

Service for relaying ERC-3009 (TransferWithAuthorization) transactions, enabling gasless token transfers.

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
RPC_URL=https://your-rpc-endpoint.com
RELAYER_PK=0xYourPrivateKey

# Optional
PORT=3001
TOKEN_ALLOWLIST=0xToken1,0xToken2,0xToken3  # Comma-separated list of allowed token addresses
API_KEY=your-secret-api-key-here  # API key for authentication (optional, disables auth if not set)
```

See `env.example` for a template.

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

## CORS & Authentication

### CORS Configuration

The service is configured with CORS to allow requests from:

- `https://seapay.ai`
- `https://app.seapay.ai`
- `https://sea-pay-app.vercel.app`
- Any subdomain of `*.seapay.ai`
- `http://localhost:3000` (development)
- `http://localhost:3001` (development)

### API Key Authentication

**Development Mode**: If `API_KEY` is not set in environment variables, authentication is disabled.

**Production Mode**: Set `API_KEY` in your `.env` file. Clients must include the API key in the `X-API-Key` header:

```bash
curl -H "X-API-Key: your-api-key" http://localhost:3001/api/tokenDomain?token=0x...
```

**Note**: The `/health` endpoint is always public and does not require authentication.

## Testing the API

### 1. Health Check (Public)

```bash
curl http://localhost:3001/health
```

Expected response:

```json
{ "ok": true }
```

### 2. Get Token Domain

Get the EIP-712 domain for a token:

```bash
# Without API key (if API_KEY not set)
curl "http://localhost:3001/api/tokenDomain?token=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"

# With API key (if API_KEY is set)
curl -H "X-API-Key: your-api-key" \
  "http://localhost:3001/api/tokenDomain?token=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
```

Expected response:

```json
{
  "name": "USD Coin",
  "version": "2",
  "chainId": 1,
  "verifyingContract": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
}
```

### 3. Relay a Transfer

**Note:** This requires a properly signed ERC-3009 authorization. See the test script below for a complete example.

```bash
# Without API key (if API_KEY not set)
curl -X POST http://localhost:3001/api/relay \
  -H "Content-Type: application/json" \
  -d '{

# With API key (if API_KEY is set)
curl -X POST http://localhost:3001/api/relay \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "token": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    "from": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "to": "0x8ba1f109551bD432803012645Hac136c22C3e0",
    "value": "1000000",
    "validAfter": "1704067200",
    "validBefore": "1704153600",
    "nonce": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    "signature": "0x...",
    "domain": {
      "name": "USD Coin",
      "version": "2",
      "chainId": 1,
      "verifyingContract": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
    }
  }'
```

Expected response:

```json
{
  "txHash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
}
```

## Test Scripts

### Node.js Test Script (Recommended)

A complete test script is available at `test-relay.mjs`. It demonstrates:

1. Health check
2. Fetching the token domain
3. Creating a signed authorization
4. Relaying the transaction

To use it:

```bash
# From monorepo root
FROM_PK=0xYourPrivateKey \
TO=0x8ba1f109551bD432803012645Hac136c22C3e0 \
VALUE=1000000 \
pnpm --filter @seapay/relayer-service test

# Or directly
cd services/relayer
FROM_PK=0xYourPrivateKey node test-relay.mjs
```

### Shell Test Script

A simpler shell script is available at `test-relay.sh` for basic endpoint testing:

```bash
# Make it executable
chmod +x test-relay.sh

# Run
./test-relay.sh
```

## API Documentation

### OpenAPI Spec

The API is documented in `openapi.yaml`. To validate it:

```bash
pnpm --filter @seapay/relayer-service openapi:validate
```

To bundle it:

```bash
pnpm --filter @seapay/relayer-service openapi:bundle
```

### View Documentation

You can view the API documentation using:

- **Swagger UI**: Upload `openapi.yaml` to [editor.swagger.io](https://editor.swagger.io)
- **Redoc**: Use `npx redoc-cli serve openapi.yaml`
- **Postman**: Import `openapi.yaml` into Postman

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": "error message"
}
```

Common error messages:

- `"token required"` - Missing token parameter
- `"token not allowed"` - Token not in allowlist (if configured)
- `"missing fields"` - Required fields missing in request
- `"invalid signature"` - Signature verification failed
- `"nonce already used"` - Nonce has been used before
- `"authorization not in valid window"` - Current time outside validAfter/validBefore window
- `"internal_error"` - Server error

## Development

### Project Structure

```
services/relayer/
├── src/
│   └── server.ts          # Main server file
├── openapi.yaml           # API specification
├── package.json
├── tsconfig.json
└── README.md
```

### TypeScript

The project uses TypeScript. Build output goes to `dist/`.

### Environment Loading

The service loads environment variables from:

1. `.env` in the current working directory
2. `.env` in the monorepo root (two levels up from `services/relayer`)

This allows running from either location.

## Troubleshooting

### Port Already in Use

If port 3001 is already in use, set a different port:

```bash
PORT=3002 pnpm --filter @seapay/relayer-service dev
```

### Missing Environment Variables

The service will fail to start if `RPC_URL` or `RELAYER_PK` are missing. Check the console output for the error message.

### Token Not Allowed

If you've set `TOKEN_ALLOWLIST`, make sure the token address is included. Addresses are compared case-insensitively.

### CORS Errors

If you're getting CORS errors from a browser:

1. Check that your origin is in the allowed list (see CORS Configuration above)
2. Verify the CORS middleware is loaded before routes
3. Check browser console for the exact error message

### Authentication Errors

If you get `401 unauthorized`:

1. Check that `API_KEY` is set in your environment
2. Verify you're sending the `X-API-Key` header with the correct value
3. Note: `/health` endpoint is always public and doesn't require authentication

### Testing CORS from Browser

You can test CORS from your browser console:

```javascript
fetch("http://localhost:3001/health")
  .then((r) => r.json())
  .then(console.log)
  .catch(console.error);
```

If it fails with CORS error → CORS headers are missing or origin not allowed
If it fails with 401 → Authentication issue (but health shouldn't require auth)
If it fails with network error → API is down
