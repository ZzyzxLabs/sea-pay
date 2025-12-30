# SeaPay Indexer

A blockchain indexer service that polls for ERC20 token transfers to specific deposit addresses.

## Features

- Polls ERC20 Transfer events in batches
- Filters transfers by destination address
- Configurable batch size and polling interval
- Error handling and retry logic

## Setup

1. Copy the environment example file:

```bash
cp env.example .env
```

2. Configure your `.env` file with the required values:

- `RPC_URL` - Your Ethereum RPC provider URL (e.g., Alchemy, Infura)
- `USDC_ADDRESS` - The ERC20 token contract address to monitor
- `DEPOSIT_ADDRESS` - The address to monitor transfers TO
- `START_BLOCK` - Starting block number (default: 0)
- `BATCH_SIZE` - Number of blocks to poll per batch (default: 2000)
- `POLL_INTERVAL_MS` - Poll interval when no new blocks (default: 2000ms)

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

1. The indexer connects to an Ethereum RPC provider
2. It polls for new blocks starting from `START_BLOCK`
3. For each batch of blocks, it queries for ERC20 Transfer events
4. Filters events where the `to` address matches `DEPOSIT_ADDRESS`
5. Logs detected transfers (ready for integration with session matching logic)

## Next Steps

- [ ] Add database/Redis persistence for `lastBlock`
- [ ] Implement session lookup by depositAddress + tokenAddress
- [ ] Add amount comparison logic (amount >= requiredAmount)
- [ ] Mark sessions as PAID with txHash and paidAmount
- [ ] Add health check endpoints
- [ ] Add metrics/monitoring
