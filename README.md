# SeaPay Monorepo

A monorepo for SeaPay built with pnpm workspaces.

## Structure

```
sea-pay/
├── apps/          # Applications
│   ├── web/       # Next.js web application
│   └── indexer/   # Blockchain indexer service
├── packages/      # Shared packages
│   └── tsconfig/  # Shared TypeScript configurations
└── tooling/       # Development tooling packages
```

## Getting Started

### Prerequisites

- Node.js (v20 or higher)
- pnpm (v10.26.2)

### Installation

```bash
pnpm install
```

### Development

Run all apps in development mode:

```bash
pnpm dev
```

Run a specific app:

```bash
pnpm --filter @seapay/web dev
pnpm --filter @seapay/indexer dev
```

### Building

Build all packages:

```bash
pnpm build
```

Build a specific package:

```bash
pnpm --filter @seapay/web build
pnpm --filter @seapay/indexer build
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

## Workspace Packages

- `@seapay/web` - Next.js web application
- `@seapay/indexer` - Blockchain indexer service

## Tech Stack

- **Package Manager**: pnpm
- **TypeScript**: Shared configurations in `packages/tsconfig`
- **Framework**: Next.js (web app)
- **Runtime**: Node.js with ES Modules

## License

See [LICENSE](./LICENSE) file for details.
