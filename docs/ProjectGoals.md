# Project Goals

SeaPay is a crypto payment platform focused on simple, reliable **request → pay → confirm** flows.

## Primary goals

- **Payment requests**: Represent payment requests as URIs (ERC-681 compatible where possible) and share them via links and QR codes.
- **On-chain detection**: Run indexers that detect incoming payments and persist events for reconciliation.
- **Monorepo ergonomics**: Keep apps, services, shared packages, and tooling in a single pnpm workspace to enable atomic changes.
- **Security and correctness**: Validate inputs, minimize unsafe defaults, and keep sensitive keys out of Git.

## Non-goals (for now)

- Full wallet implementation
- Full-featured analytics/BI
- Multi-tenant permissioning and complex roles


