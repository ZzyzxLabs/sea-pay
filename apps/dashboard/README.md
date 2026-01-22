# SeaPay Dashboard

Frontend-only Next.js dashboard for SeaPay, built for students with a mock-first
experience and best-effort onchain reads.

## Run locally

```bash
pnpm --filter @seapay/dashboard dev
```

Environment variables:

- `NEXT_PUBLIC_PRIVY_APP_ID` — Privy app id for embedded wallet login

## Notes

- Default chain: Base mainnet (`https://mainnet.base.org`)
- Onchain reads are best-effort; the UI always falls back to cached/mock data
- Simulated flows are stored in localStorage
