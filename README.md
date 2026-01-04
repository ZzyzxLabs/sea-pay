# SeaPay Monorepo

A monorepo for SeaPay - a crypto payment platform focused on simple, reliable **request → pay → confirm** flows. Built with pnpm workspaces.

## Overview

SeaPay enables:

- **Payment requests**: Represent payment requests as URIs (ERC-681 compatible) and share them via links and QR codes
- **On-chain detection**: Run indexers that detect incoming payments and persist events for reconciliation
- **Real-time monitoring**: WebSocket-based activity feeds for transaction monitoring

## Project Structure

```
sea-pay/
├── apps/                 # End-user applications
│   ├── app/             # Main Next.js app with real-time activity monitoring (@seapay/app)
│   ├── web/             # Marketing/landing page Next.js app (@seapay/web)
│   ├── erc3009-relay/   # ERC-3009 meta-transaction relay service (@seapay/erc3009-relay)
│   ├── indexer/         # Simple polling indexer with WebSocket frontend (@seapay/indexer)
│   └── webhook/         # Express webhook server with Socket.io (@seapay/webhook)
├── services/            # Production backend services
│   └── indexer/         # Production indexer service with Supabase persistence (@seapay/indexer-service)
├── packages/            # Shared libraries and configuration
│   ├── erc3009/         # ERC-3009 EIP-712 signing utilities (@seapay-ai/erc3009)
│   └── tsconfig/        # Shared TypeScript base configurations
├── tooling/             # Developer tooling packages
│   ├── qr-generator/    # ERC-681 + QR code generator CLI (@seapay/qr-generator)
│   └── contracts/      # Foundry smart contract workspace (ERC3009, ERC20Token)
└── docs/                # Project documentation
```

## Applications (`apps/`)

### `@seapay/app` - Main Application

**Location**: `apps/app/`

Next.js application with real-time blockchain activity monitoring:

- Real-time WebSocket activity feed
- Filtered monitoring with Alchemy webhook integration
- Transaction activity cards with copy-to-clipboard
- Supabase integration for data persistence

**Tech Stack**: Next.js 16, React 19, TypeScript, Tailwind CSS 4, Socket.io Client

### `@seapay/web` - Marketing Site

**Location**: `apps/web/`

Next.js marketing/landing page application with:

- Hero section
- Features showcase
- Pricing information
- FAQ section
- Social proof

**Tech Stack**: Next.js 16, React 19, TypeScript, Tailwind CSS 4

### `@seapay/indexer` - Simple Indexer

**Location**: `apps/indexer/`

Real-time webhook monitoring system:

- Express webhook server (port 3000) with Socket.io
- Next.js frontend (port 3001) for activity display
- WebSocket-based real-time updates

**Tech Stack**: Express.js, Socket.io, Next.js, TypeScript

### `@seapay/erc3009-relay` - Meta-Transaction Relay

**Location**: `apps/erc3009-relay/`

Express server for relaying ERC-3009 meta-transactions:

- Handles signed authorization requests
- Submits transactions on behalf of users
- Uses `@seapay-ai/erc3009` package for signing

**Tech Stack**: Express.js, ethers.js, TypeScript

### `@seapay/webhook` - Webhook Server

**Location**: `apps/webhook/`

Express server with Socket.io for receiving and broadcasting webhook events:

- Receives POST requests at `/webhook`
- Broadcasts events to connected WebSocket clients
- CORS enabled for frontend connections

**Tech Stack**: Express.js, Socket.io

## Services (`services/`)

### `@seapay/indexer-service` - Production Indexer

**Location**: `services/indexer/`

Production-ready blockchain indexer service:

- Multi-chain support (Ethereum, Sepolia, Base, etc.)
- Watchlist-based address monitoring
- Supabase integration for data persistence
- Batch processing with configurable block sizes
- Automatic cursor management for safe restarts
- Concurrent RPC queries with rate limiting

**Tech Stack**: TypeScript, ethers.js, Supabase

**Database Schema**:

- `watchlist_addresses` - Addresses to monitor per chain
- `chain_cursors` - Last processed block per chain
- `erc20_transfers` - Persisted transfer events

## Packages (`packages/`)

### `@seapay-ai/erc3009` - ERC-3009 Utilities

**Location**: `packages/erc3009/`

TypeScript utilities for ERC-3009 (Transfer With Authorization) EIP-712 signing:

- Build typed data for EIP-712 signing
- Sign transfer authorizations
- Helper functions for common use cases
- Published to npm as `@seapay-ai/erc3009`

**Tech Stack**: TypeScript, ethers.js v6

### `@seapay/tsconfig` - Shared TypeScript Config

**Location**: `packages/tsconfig/`

Shared TypeScript base configurations for the monorepo.

## Tooling (`tooling/`)

### `@seapay/qr-generator` - QR Code Generator

**Location**: `tooling/qr-generator/`

CLI tool and library for generating QR codes for Ethereum address URIs (ERC-681):

- Generate QR codes in PNG, SVG, or terminal format
- ERC-681 URI generation (`ethereum:0x...` or `ethereum:vitalik.eth`)
- Command-line interface via `seapay-qr` binary

**Tech Stack**: TypeScript, qrcode library

### `tooling/contracts/` - Smart Contracts

**Location**: `tooling/contracts/`

Foundry workspace for smart contract development:

- `ERC3009.sol` - ERC-3009 implementation
- `ERC20Token.sol` - Test ERC20 token
- Unit and integration tests
- Forge testing framework

**Tech Stack**: Solidity, Foundry

## Getting Started

### Prerequisites

- Node.js (v20 or higher)
- pnpm (v10.26.2)
- For contracts: Foundry (if working with smart contracts)

### Installation

```bash
pnpm install
```

### Development

Run all apps in development mode:

```bash
pnpm dev
```

This runs:

- `@seapay/app` (Next.js dev server)
- `@seapay/webhook` (Express server)
- `@seapay/web` (Next.js dev server)

Run a specific app:

```bash
pnpm --filter @seapay/app dev
pnpm --filter @seapay/web dev
pnpm --filter @seapay/indexer dev
pnpm --filter @seapay/erc3009-relay dev
pnpm --filter @seapay/webhook dev
```

Run services:

```bash
pnpm --filter @seapay/indexer-service dev
```

### Building

Build all packages:

```bash
pnpm build
```

Build a specific package:

```bash
pnpm --filter @seapay/app build
pnpm --filter @seapay/web build
pnpm --filter @seapay-ai/erc3009 build
```

### Linting

Lint all packages:

```bash
pnpm lint
```

### Type Checking

Type check all packages:

```bash
pnpm typecheck
```

### Cleaning

Remove all build artifacts and dependencies:

```bash
pnpm clean
```

## Workspace Packages

### Applications

- `@seapay/app` - Main Next.js application with activity monitoring
- `@seapay/web` - Marketing/landing page
- `@seapay/indexer` - Simple indexer with WebSocket frontend
- `@seapay/erc3009-relay` - Meta-transaction relay service
- `@seapay/webhook` - Webhook server with Socket.io

### Services

- `@seapay/indexer-service` - Production indexer with database persistence

### Packages

- `@seapay-ai/erc3009` - ERC-3009 EIP-712 signing utilities (published to npm)
- `@seapay/qr-generator` - QR code generator CLI and library

## Tech Stack

- **Package Manager**: pnpm with workspaces
- **TypeScript**: Shared configurations in `packages/tsconfig`
- **Frameworks**:
  - Next.js 16 (web apps)
  - Express.js (services)
- **Blockchain**:
  - ethers.js v6
  - Foundry (smart contracts)
- **Database**: Supabase
- **Real-time**: Socket.io
- **Styling**: Tailwind CSS 4
- **Runtime**: Node.js with ES Modules

## Documentation

Additional documentation can be found in the `docs/` directory:

- `CHANGELOG.md` - Project changelog
- `DirectoryStructure.md` - Detailed directory structure
- `MONOREPO_SETUP.md` - Monorepo setup guide
- `ProjectGoals.md` - Project goals and non-goals
- `TASK.md` - Task tracking

## License

See [LICENSE](./LICENSE) file for details.
