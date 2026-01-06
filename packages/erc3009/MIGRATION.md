# Migration Guide: v0.0.x → v0.1.0

Version 0.1.0 introduces a multi-chain architecture with significant API improvements.

## Breaking Changes

### Removed Functions

- `USDC_Domain()` - Use `resolveDomain({ chainId, token: "USDC" })` instead
- `message_5_minutes()` - Use `buildMessageWithTTL()` or `prepare()` instead

### Migration Examples

#### Before (v0.0.x)

```typescript
import {
  USDC_Domain,
  message_5_minutes,
  buildTypedData,
  buildTypes,
} from "@seapay-ai/erc3009";

const domain = USDC_Domain(); // Hardcoded Base Sepolia
const message = message_5_minutes(from, to, value);
const types = buildTypes();
const typed = buildTypedData({ domain, message });

const signature = await wallet.signTypedData(domain, types, message);
```

#### After (v0.1.0) - Option 1: Ergonomic API

```typescript
import { prepare } from "@seapay-ai/erc3009";

const { domain, message, typedData } = prepare({
  chainId: 84532, // Base Sepolia
  token: "USDC",
  from,
  to,
  value,
  ttlSeconds: 300, // optional, default: 300
});

const signature = await wallet.signTypedData(
  typedData.domain,
  typedData.types,
  typedData.message
);
```

#### After (v0.1.0) - Option 2: Manual Builders

```typescript
import {
  resolveDomain,
  buildMessageWithTTL,
  buildTypedData,
} from "@seapay-ai/erc3009";

const domain = resolveDomain({ chainId: 84532, token: "USDC" });
const message = buildMessageWithTTL({ from, to, value, ttlSeconds: 300 });
const typedData = buildTypedData({ domain, message });

const signature = await wallet.signTypedData(
  typedData.domain,
  typedData.types,
  typedData.message
);
```

## New Features

### 1. Multi-Chain Support

```typescript
// Base mainnet
prepare({ chainId: 8453, token: "USDC", ... });

// Ethereum mainnet
prepare({ chainId: 1, token: "USDC", ... });

// Arbitrum
prepare({ chainId: 42161, token: "USDC", ... });
```

### 2. Registry

```typescript
import { registry, getToken } from "@seapay-ai/erc3009";

// Get token config
const usdc = getToken("USDC", 8453);
console.log(usdc.verifyingContract); // 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913

// List chains
const chains = registry.listChains();
```

### 3. Custom Tokens

```typescript
prepare({
  chainId: 8453,
  token: "0xCustomAddress",
  name: "Custom Token",
  version: "1",
  verifyingContract: "0xCustomAddress",
  from,
  to,
  value,
});
```

### 4. Signature Verification

```typescript
import { verifySignature } from "@seapay-ai/erc3009";

const isValid = verifySignature(domain, message, signature, expectedSigner);
```

## Recommended Update Path

1. **Replace `USDC_Domain()`** with `resolveDomain({ chainId, token: "USDC" })` or use `prepare()`
2. **Replace `message_5_minutes()`** with `buildMessageWithTTL()` or use `prepare()`
3. **Add chainId parameter** to your config (was hardcoded to Base Sepolia)
4. **Test thoroughly** - domain parameters may differ between chains

## TypeScript Types

Import types from the package:

```typescript
import type {
  EIP712Domain,
  TransferWithAuthorization,
  TokenConfig,
  ChainConfig,
} from "@seapay-ai/erc3009";
```

## Questions?

See the [README](./README.md) for complete documentation and examples.
