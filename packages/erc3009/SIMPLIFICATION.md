# @seapay-ai/erc3009 Simplification

## What Changed

The package was simplified from 30+ files to just **6 core files**:

### New Structure

```
packages/erc3009/src/
├── index.ts          # Main exports
├── types/
│   └── index.ts      # TypeScript types
├── registry.ts       # Token/chain registry
├── build.ts          # Build typed data + messages
├── verify.ts         # Signature verification
└── utils.ts          # Utilities (nonce, time)
```

### Removed Complexity

**Removed:**
- `api/` directory (ergonomic API wrapper - not needed)
- `domain/` directory (domain resolution logic - merged into build.ts)
- `erc3009/` directory (scattered ERC-3009 logic - consolidated)
- Old `registry/` directory structure (chains, tokens subdirectories)
- Old `utils/` directory structure (hex, time, nonce separate files)
- `core.ts` (namespace wrapper - not needed)
- Complex type files (domain.ts, erc3009.ts, registry.ts)

## Core API

### 1. Build Functions (build.ts)

```typescript
import { buildMessage, buildTypedData, nowPlusSeconds } from "@seapay-ai/erc3009";

// Build message
const message = buildMessage({
  from: "0x...",
  to: "0x...",
  value: 1000000n,
  validBefore: nowPlusSeconds(300),
});

// Build complete typed data (auto-resolves domain from registry)
const { domain, types, message: msg } = buildTypedData({
  chainId: 8453,
  token: "USDC",
  message,
});
```

### 2. Registry (registry.ts)

```typescript
import { registry, getTokenInfo } from "@seapay-ai/erc3009";

// Get token info
const token = registry.getToken("USDC", 8453);

// Check support
const isSupported = registry.isSupported("USDC", 8453);

// List chains
const chains = registry.listChains();
```

### 3. Verification (verify.ts)

```typescript
import { verifySignature, recoverSigner } from "@seapay-ai/erc3009";

// Verify
const isValid = verifySignature(domain, message, signature, expectedSigner);

// Recover signer
const signer = recoverSigner(domain, message, signature);
```

### 4. Utilities (utils.ts)

```typescript
import { randomNonce, nowPlusSeconds, nowSeconds } from "@seapay-ai/erc3009";

const nonce = randomNonce(); // Random bytes32
const validBefore = nowPlusSeconds(300); // 5 minutes from now
```

## Benefits

1. **Simpler API** - Only 4 core functions to learn
2. **Less code** - 6 files instead of 30+
3. **Easier to maintain** - All related code in one place
4. **Still type-safe** - Full TypeScript support
5. **Registry included** - USDC on 10 chains
6. **Backwards compatible** - Can still add complexity if needed

## Migration

Old code using complex API:

```typescript
import { prepare, erc3009 } from "@seapay-ai/erc3009";

const { typedData } = prepare({ chainId, token, from, to, value, ttlSeconds });
const sig = await erc3009.sign(wallet, typedData.domain, typedData.message);
```

New simplified code:

```typescript
import { buildMessage, buildTypedData, nowPlusSeconds } from "@seapay-ai/erc3009";

const message = buildMessage({ from, to, value, validBefore: nowPlusSeconds(300) });
const { domain, types, message: msg } = buildTypedData({ chainId, token, message });
const sig = await wallet.signTypedData(domain, types, msg);
```

## What's Still Included

- ✅ Full USDC registry (10 chains: Ethereum, Base, Arbitrum, Optimism, Polygon + testnets)
- ✅ Correct Base domain names (Base mainnet uses "USD Coin", Base Sepolia uses "USDC")
- ✅ Type-safe TypeScript definitions
- ✅ ethers.js v6 integration
- ✅ Domain overrides for custom tokens
- ✅ Signature verification & recovery

## Package Size

- **Before:** 30+ source files, complex directory structure
- **After:** 6 source files, flat structure
- **Built output:** Still tree-shakeable ES modules
