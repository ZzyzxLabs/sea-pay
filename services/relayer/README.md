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

### 3. Solana (devnet/localnet) Config

Add the following for Solana relaying:

- `SOLANA_RPC_URL` (default devnet)
- `SOLANA_WS_URL` (optional, defaults to RPC with ws scheme)
- `SOLANA_FEE_PAYER_SECRET` base58 secret (optional, used to co-sign/pay fees)
- `KORA_RPC_URL` + `KORA_SIGNER_ADDRESS` (optional, enable `useKora=true` path)
- `SOLANA_RELAY_URL` (defaults to `http://localhost:3001/solana/relay`)

For devnet testing, set:

```bash
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_TEST_SENDER_SECRET=<base58 devnet key>   # or leave blank to auto-generate + airdrop
SOLANA_TEST_RECIPIENT=<recipient pubkey>        # optional
SOLANA_TEST_LAMPORTS=10000000                   # 0.01 SOL
```

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

### 4. Solana Relay - Fee Payer

**POST `/solana/relay`**

Relays a Solana transaction using the backend fee payer. The relayer co-signs the transaction and pays SOL fees on behalf of the user.

**Requires**: `SOLANA_FEE_PAYER_SECRET` environment variable

Request body:

```json
{
  "transaction": "<base64 tx>",
  "waitForConfirmation": true,
  "skipPreflight": false,
  "rpcUrl": "https://api.devnet.solana.com"
}
```

Response:

```json
{
  "signature": "5p7...abc",
  "cluster": "https://api.devnet.solana.com",
  "mode": "fee-payer-sign",
  "confirmed": true
}
```

### 5. Solana Relay - Kora (Gasless)

**POST `/solana/kora`**

Relays a Solana transaction using Kora for gasless fee payment. Kora allows users to pay fees with SPL tokens instead of SOL.

**Requires**: `KORA_RPC_URL` and `KORA_SIGNER_ADDRESS` environment variables (or `koraSigner` in request)

Request body:

```json
{
  "transaction": "<base64 tx>",
  "koraSigner": "3Z1Ef7YaxK8oUMoi6exf7wYZjZKWJJsrzJXSt1c3qrDE", // Optional if KORA_SIGNER_ADDRESS is set
  "waitForConfirmation": true,
  "skipPreflight": false,
  "rpcUrl": "https://api.devnet.solana.com"
}
```

Response:

```json
{
  "signature": "5p7...abc",
  "cluster": "https://api.devnet.solana.com",
  "mode": "kora-sign",
  "confirmed": true
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

### Solana Devnet Test

```bash
# From services/relayer
pnpm test:solana:devnet
```

**Using Fee Payer (default)**:

```bash
SOLANA_TEST_SENDER_SECRET=...
SOLANA_TEST_RECIPIENT=...
SOLANA_SPL_MINT=...
SOLANA_SPL_AMOUNT=...
SOLANA_RELAY_URL=http://localhost:3001/solana/relay
pnpm test:solana:devnet
```

**Using Kora (gasless)**:

```bash
SOLANA_TEST_SENDER_SECRET=...
SOLANA_TEST_RECIPIENT=...
SOLANA_SPL_MINT=...
SOLANA_SPL_AMOUNT=...
SOLANA_USE_KORA=true
SOLANA_KORA_URL=http://localhost:3001/solana/kora
KORA_SIGNER_ADDRESS=...  # Optional if set in server env
pnpm test:solana:devnet
```

Environment variables:

- `SOLANA_RPC_URL` (defaults to devnet)
- `SOLANA_TEST_SENDER_SECRET` (base58; optional, otherwise auto-generate + airdrop)
- `SOLANA_TEST_RECIPIENT` (optional)
- `SOLANA_TEST_LAMPORTS` (optional, default 0.01 SOL)
- `SOLANA_RELAY_URL` (defaults to http://localhost:3001/solana/relay)

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

## Solana & Kora Integration

### Do You Need a Kora Server?

**Short answer**: It depends on your use case.

#### Option 1: Regular SPL Token Transfers (No Kora Required)

For standard SPL token transfers where users pay SOL fees themselves:

- ✅ **No Kora server needed**
- User signs transaction with their wallet
- User pays SOL fees from their wallet
- Relayer just forwards the transaction (`mode: "forward"`)

**Configuration**: Only need `SOLANA_RPC_URL` (defaults to devnet).

#### Option 2: Relayer Pays Fees (No Kora Required)

If you want the relayer to pay SOL fees on behalf of users:

- ✅ **No Kora server needed**
- User signs transaction
- Relayer co-signs and pays SOL fees
- Requires `SOLANA_FEE_PAYER_SECRET` in env

**Configuration**:

- `SOLANA_RPC_URL`
- `SOLANA_FEE_PAYER_SECRET` (base58 encoded keypair)

#### Option 3: Gasless Transactions with SPL Tokens (Kora Required)

For gasless transactions where users pay fees with SPL tokens instead of SOL:

- ✅ **Kora server required**
- User signs transaction
- Kora server validates and co-signs
- User pays fees with SPL tokens (e.g., USDC)
- Requires running Kora RPC server

**Configuration**:

- `KORA_RPC_URL` - Your Kora RPC server endpoint
- `KORA_SIGNER_ADDRESS` - Signer address configured in Kora
- Set `useKora: true` in request body

### Setting Up Kora Server

To enable gasless SPL token transfers, you need to run a Kora RPC server. Follow the [Kora Quick Start Guide](https://launch.solana.com/docs/kora/getting-started/quick-start):

1. **Install Kora CLI**:

   ```bash
   cargo install kora-cli
   ```

2. **Configure Kora** (`kora.toml`):

   - Set `allowed_spl_paid_tokens` to your token mint addresses
   - Configure `max_allowed_lamports` for fee limits
   - Set `allowed_programs` (e.g., Token Program)

3. **Configure Signers** (`signers.toml`):

   - Define signer keypairs for fee payment

4. **Start Kora RPC Server**:

   ```bash
   kora rpc start --signers-config signers.toml
   ```

5. **Update Relayer Config**:
   ```bash
   KORA_RPC_URL=http://localhost:8899  # Your Kora server URL
   KORA_SIGNER_ADDRESS=YourSignerPubkey
   ```

### Testing SPL Token Transfers

The test script (`test-solana-devnet.mjs`) supports both fee payer and Kora modes:

**Fee Payer Mode (default)**:

```bash
SOLANA_TEST_SENDER_SECRET=<base58_secret>
SOLANA_TEST_RECIPIENT=<recipient_pubkey>
SOLANA_SPL_MINT=<token_mint_address>
SOLANA_SPL_AMOUNT=<amount_in_smallest_unit>
SOLANA_RELAY_URL=http://localhost:3001/solana/relay

./test-relay.sh solana devnet
```

**Kora Mode**:

```bash
SOLANA_TEST_SENDER_SECRET=<base58_secret>
SOLANA_TEST_RECIPIENT=<recipient_pubkey>
SOLANA_SPL_MINT=<token_mint_address>
SOLANA_SPL_AMOUNT=<amount_in_smallest_unit>
SOLANA_USE_KORA=true
SOLANA_KORA_URL=http://localhost:3001/solana/kora
KORA_SIGNER_ADDRESS=<kora_signer_pubkey>  # Optional if set in server env

./test-relay.sh solana devnet
```

### Kora Client vs Server

- **Kora Client** (`@solana/kora`): JavaScript SDK for interacting with Kora RPC
- **Kora Server** (`kora-cli`): Rust-based RPC server that validates and signs transactions

The relayer uses the **Kora Client** to communicate with your **Kora Server**. You must run a Kora server separately - it's not included in this relayer service.

## Related Packages

- [`@seapay-ai/erc3009`](../../packages/erc3009) - ERC-3009 helper library
- [`@seapay/deeplink`](../../packages/deeplink) - DeepLink generator for mobile wallets
- [`@solana/kora`](https://www.npmjs.com/package/@solana/kora) - Kora JavaScript client

## License

Apache-2.0
