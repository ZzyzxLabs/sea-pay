# Dashboard Plan

## App location & structure

- App root: `apps/dashboard`
- Runs with `pnpm --filter @seapay/dashboard dev`
- Standalone now, ready to extract shared UI later

```
apps/dashboard
  app/                 # Next App Router routes
  components/          # Layout + UI pieces
  hooks/               # Client hooks and polling
  lib/                 # Formatting + storage helpers
  services/
    evm/               # Best-effort RPC reads
    mock/              # Simulated flows
```

## Default chain choice

**Base mainnet** is the default for MVP because it aligns with SeaPay’s context,
has low fees, and offers free public RPCs + USDC support.

## Build order

1) App shell and design tokens  
2) Route pages with mock data  
3) Privy login + embedded wallet  
4) EVM read adapter (balances + transfers)  
5) Activity feed unification and polish
