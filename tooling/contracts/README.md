# SeaPay Contracts (Foundry)

This folder contains the Foundry workspace for SeaPay smart contracts.

## Layout

- `src/` – contracts (ERC3009, ERC20Token)
- `test/` – Foundry tests
- `lib/` – vendored dependencies (forge-std)
- `out/`, `cache/`, `broadcast/` – build artifacts (ignored)

## Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation)

## Common commands

```bash
# Build
forge build

# Test
forge test

# Format
forge fmt

# Gas snapshot
forge snapshot

# Run local Anvil node
anvil
```

## Notes for the monorepo

- This project does **not** need pnpm; it’s pure Foundry.
- Build outputs (`out/`, `cache/`, `broadcast/`) are ignored via `.gitignore`.
- Keep dependencies under `lib/` (added by `forge install …`).
