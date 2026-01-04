# Directory Structure

This document describes the current monorepo layout.

## Top-level

```
sea-pay/
├── apps/                 # End-user applications
├── services/             # Backend services / daemons
├── packages/             # Shared libraries and shared configuration packages
├── tooling/              # Developer tooling packages
├── docs/                 # Project documentation
├── package.json          # Root scripts + pnpm workspace entry
├── pnpm-workspace.yaml   # Workspace package globs
└── pnpm-lock.yaml        # Single lockfile for the monorepo
```

## apps/

```
apps/
├── web/                  # Next.js web application (@seapay/web)
└── indexer/              # Simple polling indexer (@seapay/indexer)
```

## services/

```
services/
└── indexer/              # Production indexer service (@seapay/indexer-service)
```

## packages/

```
packages/
├── tsconfig/             # Shared TypeScript base config
└── erc3009/              # EIP-3009 signing helper (@seapay/erc3009)
```

## tooling/

```
tooling/
├── qr-generator/         # ERC-681 + QR generator (@seapay/qr-generator)
└── contracts/            # Foundry smart contract workspace
```
