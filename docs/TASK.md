# TASK

This file tracks work needed to reach the project goals.

## In progress

- [ ] Define canonical SeaPay payment request format (ERC-681 subset + extensions)
- [ ] Implement web routes for `https://seapay.ai/p/<request>` and request decoding
- [ ] Integrate indexer → session matching → payment status updates

## Backlog

- [ ] Add shared `@seapay/types` and `@seapay/utils` packages
- [ ] Add CI workflows (lint/typecheck/build)
- [ ] Add database migrations / schema for indexer tables
- [ ] Add observability (logs/metrics/health checks)
- [ ] Add multi-chain configuration strategy (per-chain services / sharding)

## Completed

- [x] Setup pnpm workspace monorepo structure
- [x] Add QR generator tooling package (`@seapay/qr-generator`)
