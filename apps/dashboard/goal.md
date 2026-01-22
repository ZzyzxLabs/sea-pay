Updated AI prompt (frontend-only inside SeaPay monorepo)

You are building a frontend-only dashboard inside an existing SeaPay pnpm monorepo. Assume there may be reusable packages/components later, but do not depend on them right now. Create a new Next.js (App Router) React TypeScript app that runs independently in the monorepo.

Tech constraints

Frontend only (no custom backend required)

Next.js App Router + React + TypeScript

pnpm workspace

UI: shadcn/ui first, Tailwind, lucide-react icons

Wallet: Privy embedded wallet

Chains: EVM only for now

Stablecoin: USDC prioritized

Indexing: free RPC only, read-only, best-effort (handle flakiness gracefully)

Yield, tokenized stocks, and card flows are simulated (mock data + fake transactions)

Audience & tone

Target users: APAC students + US students

Product tone: minimal, young, slightly cute, friendly and simple

“Crypto abstracted”: default language is money (balance, savings, spending, investing)

Put blockchain details behind an Advanced panel (addresses, chain, RPC status)

Required product modules

Earn (simulated yield)

Savings-like screen: Deposit, Withdraw, APY, earnings over time

Simulate accrual daily/hourly locally

Stablecoin Card (simulated)

“Get a card” onboarding stepper

Card status + spending transaction list

Tokenized Stocks (simulated)

Browse “stocks”, buy/sell modal, portfolio positions, P/L

Mark clearly as simulated/beta

App routes (must implement)

/ Overview (balance, quick actions, module cards)

/earn

/card

/invest

/activity (unified feed: simulated + any onchain events you can read)

/settings (profile, wallet, advanced)

Data architecture

Implement a clean data layer with adapters:

services/evm/ for EVM reads (balances + recent transfers best-effort)

services/mock/ for simulated yield/card/stocks

Prefer mock-first: the app must look complete even if RPC fails.

Add caching + polling:

balances: 15–30s

activity: 30–60s

show “last updated” timestamp and RPC health pill

Branding

Create a simple brand set:

1 primary accent color, 1 secondary accent, neutral grayscale

friendly rounded radius (2xl), soft borders, subtle gradients used sparingly

Use shadcn theme tokens; keep contrast accessible.

Deliverables

Folder structure + setup instructions

Full UI implementation for all routes

Privy integration: login + embedded wallet + show address (Advanced)

Simulated flows for earn/card/stocks (local state + fake activity)

Best-effort EVM read-only:

native balance

USDC balance on at least one chain (choose a default chain and make it swappable)

recent transfers if possible via eth_getLogs limited lookback window

Strong UX states:

skeleton loading

empty states

error states with retry

“Simulated” badges where appropriate

Do the work in this order:

Propose monorepo-friendly app location and folder tree

Pick a default EVM chain for MVP and justify briefly

Create design system tokens + reusable layout components

Build all routes with mock data

Integrate Privy

Add EVM adapter reads with free RPC + graceful fallbacks

Polish

At the end, ask for any missing specs that would change implementation (not things you can decide yourself).

Frontend-only plan (what you should build, in order)
1) Add the dashboard app to the monorepo

Create: apps/dashboard/ (or apps/seapay-dashboard/)

It should run with: pnpm --filter <app> dev

Keep it standalone, but structured so later you can extract shared UI into packages/ui.

2) Establish the UI shell + “SeaPay vibes”

Build these first so everything stays consistent:

Layout:

Desktop: sidebar + topbar

Mobile: bottom nav

Global components:

AppShell, SidebarNav, TopBar, MobileNav

BalanceCard, ModuleCard, EmptyState, SkeletonCard

Style tokens:

radius: 2xl

borders: light + subtle

“cute” comes from spacing + microcopy + rounded chips, not bright colors

3) Mock-first feature implementations

Earn (simulated)

Local “vault balance”, “apy”, “earned”

Deposit/withdraw forms with confirm dialog

Mini chart (can be simple list/graph later)

Card (simulated)

Stepper: Apply → Verify → Shipping → Activate

Spending feed with categories and merchant icons

Invest (simulated)

Asset list (AAPL, TSLA, NVDA, etc as “tokenized”)

Buy/sell modal updates positions locally

Portfolio summary + allocation

4) Privy embedded wallet

Add login button in topbar

On login:

show “Wallet ready”

store/display EVM address in Settings → Advanced

If user is not logged in, app still works with mock mode.

5) EVM free-RPC adapter (best-effort)

Pick a default chain (suggestion: Base for your SeaPay context, but make it switchable).

Implement:

getNativeBalance(address)

getUsdcBalance(address) (chain config includes USDC contract)

getRecentUsdcTransfers(address, lookbackBlocks) via eth_getLogs

Handle failures:

show cached data + “RPC degraded” badge

don’t block the UI

6) Activity feed unification

Merge:

simulated events (deposits, buys, card spends)

onchain events (USDC transfers) if available

Normalize into one ActivityItem shape for rendering.

7) Polish

Fast feel: skeletons, optimistic UI for simulated actions

“Crypto abstracted”: hide chain terms unless Advanced is open

Add a subtle “Simulated” badge on modules