# SeaPay Contracts (Foundry)

This folder contains the Foundry workspace for SeaPay smart contracts.

## Layout

- `src/` – contracts (currently the Counter example)
- `script/` – deployment scripts (Counter example)
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

# Example deploy script (replace RPC/PK)
forge script script/Counter.s.sol:CounterScript \
  --rpc-url <your_rpc_url> \
  --private-key <your_private_key>
```

## Notes for the monorepo

- This project does **not** need pnpm; it’s pure Foundry.
- Build outputs (`out/`, `cache/`, `broadcast/`) are ignored via `.gitignore`.
- Keep dependencies under `lib/` (added by `forge install …`).
