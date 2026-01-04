# SeaPay Indexer Service

A production-ready blockchain indexer service that monitors ERC20 token transfers across multiple chains using Supabase for persistence.

## Features

- Multi-chain support (Ethereum, Sepolia, Base, etc.)
- Watchlist-based address monitoring
- Supabase integration for data persistence
- Batch processing with configurable block sizes
- Automatic cursor management for safe restarts
- Concurrent RPC queries with rate limiting

## Setup

1. Copy the environment example file:

```bash
cp env.example .env
```

2. Configure your `.env` file:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# RPC URLs per chain
RPC_ETHEREUM=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
RPC_SEPOLIA=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
RPC_BASE=https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY

# Chain Configuration
CHAIN=sepolia  # Which chain this process handles

# Polling Configuration
CONFIRMATIONS=1          # Number of confirmations required
BLOCK_BATCH_SIZE=200     # Blocks per batch
POLL_MS=4000            # Poll interval in milliseconds
```

## Database Schema

The service expects the following Supabase tables:

### `watchlist_addresses`

- `chain` (text) - Chain identifier
- `address` (text) - Address to monitor
- `is_active` (boolean) - Whether to monitor this address

### `chain_cursors`

- `chain` (text, primary key) - Chain identifier
- `last_processed_block` (bigint) - Last processed block number
- `updated_at` (timestamp) - Last update time

### `erc20_transfers`

- `chain` (text)
- `block_number` (bigint)
- `block_hash` (text)
- `tx_hash` (text)
- `log_index` (integer)
- `token_address` (text)
- `from_address` (text)
- `to_address` (text)
- `amount_raw` (text) - Amount as string
- Primary key: `(chain, tx_hash, log_index)`

## Development

Run in development mode:

```bash
pnpm dev
```

Build:

```bash
pnpm build
```

Run production build:

```bash
pnpm start
```

## How It Works

1. Loads watchlist addresses for the configured chain from Supabase
2. Retrieves the last processed block cursor
3. Polls for new blocks with configurable confirmations
4. Fetches ERC20 Transfer events for watched addresses (both `from` and `to`)
5. Decodes and stores transfers in Supabase
6. Updates the cursor to track progress

## Multi-Chain Deployment

To run multiple chains, deploy separate instances with different `CHAIN` environment variables:

```bash
# Instance 1: Sepolia
CHAIN=sepolia pnpm start

# Instance 2: Base
CHAIN=base pnpm start
```

## Differences from apps/indexer

- **apps/indexer**: Simple polling for specific token/deposit address pairs
- **services/indexer**: Production service with database persistence, watchlist support, and multi-chain capabilities
