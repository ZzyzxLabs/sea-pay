# @seapay-ai/erc3009

Simplified TypeScript library for ERC-3009 (TransferWithAuthorization) EIP-712 signing and verification.

## Installation

```bash
pnpm add @seapay-ai/erc3009
# or
npm install @seapay-ai/erc3009
```

## Quick Start

```typescript
import {
  buildTypedData,
  buildMessage,
  resolveDomain,
  nowPlusSeconds,
} from "@seapay-ai/erc3009";
import { Wallet } from "ethers";

// 1. Build the message
const message = buildMessage({
  from: wallet.address,
  to: "0xRecipient...",
  value: 1000000n, // 1 USDC (6 decimals)
  validBefore: nowPlusSeconds(300), // Valid for 5 minutes
});

// 2. Build typed data (includes domain resolution from registry)
const {
  domain,
  types,
  message: msg,
} = buildTypedData({
  chainId: 8453, // Base mainnet
  token: "USDC",
  message,
});

// 3. Sign with ethers wallet
const signature = await wallet.signTypedData(domain, types, msg);
```

## Core Functions

### 1. Build Message

```typescript
import { buildMessage, nowPlusSeconds, randomNonce } from "@seapay-ai/erc3009";

const message = buildMessage({
  from: "0xSender...",
  to: "0xRecipient...",
  value: 1000000n, // Amount in token's smallest unit
  validAfter: 0n, // Optional, defaults to 0
  validBefore: nowPlusSeconds(300), // Unix timestamp
  nonce: randomNonce(), // Optional, auto-generated if not provided
});
```

### 2. Build Typed Data

Automatically resolves token info from the registry:

```typescript
import { buildTypedData } from "@seapay-ai/erc3009";

const typedData = buildTypedData({
  chainId: 8453, // Base mainnet
  token: "USDC", // Symbol from registry
  message,
});

// Returns:
// {
//   domain: { name, version, chainId, verifyingContract },
//   types: { TransferWithAuthorization: [...] },
//   message: { from, to, value, ... },
//   primaryType: "TransferWithAuthorization"
// }
```

For custom tokens not in the registry:

```typescript
const typedData = buildTypedData({
  chainId: 8453,
  token: "0xCustomTokenAddress",
  message,
  domainOverrides: {
    name: "My Token",
    version: "1",
    verifyingContract: "0xCustomTokenAddress",
  },
});
```

### 3. Resolve Domain

Resolve EIP-712 domain from chain ID and token:

```typescript
import { resolveDomain } from "@seapay-ai/erc3009";

// Resolve USDC domain on Base
const domain = resolveDomain(8453, "USDC");
// Returns:
// {
//   name: "USD Coin",
//   version: "2",
//   chainId: 8453,
//   verifyingContract: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
// }

// For custom tokens
const customDomain = resolveDomain(8453, "0xCustomTokenAddress", {
  name: "My Token",
  version: "1",
  verifyingContract: "0xCustomTokenAddress",
});
```

This function is useful when you need just the domain object without building the complete typed data structure. It's used internally by `buildTypedData`.

### 4. Verify Signature

```typescript
import { verifySignature, recoverSigner } from "@seapay-ai/erc3009";

// Verify signature matches expected signer
const isValid = verifySignature(domain, message, signature, expectedSigner);

// Or recover the signer address
const signer = recoverSigner(domain, message, signature);
console.log("Signed by:", signer);
```

## Registry

The package includes a built-in registry of USDC deployments across multiple chains.

### Query the Registry

```typescript
import { registry, getTokenInfo } from "@seapay-ai/erc3009";

// Get token config
const usdcBase = registry.getToken("USDC", 8453);
// => { symbol: "USDC", chainId: 8453, address: "0x...", name: "USD Coin", version: "2", decimals: 6 }

// Check if token is supported
if (registry.isSupported("USDC", 8453)) {
  console.log("USDC supported on Base");
}

// List all chains
const chains = registry.listChains();

// List tokens on a chain
const tokens = registry.listTokensOnChain(8453);

// Get chain info
const baseChain = registry.getChain(8453);
// => { chainId: 8453, name: "Base", testnet: false }
```

### Supported Chains

| Chain            | Chain ID | Testnet |
| ---------------- | -------- | ------- |
| Ethereum         | 1        | -       |
| Sepolia          | 11155111 | ✅      |
| Base             | 8453     | -       |
| Base Sepolia     | 84532    | ✅      |
| Arbitrum One     | 42161    | -       |
| Arbitrum Sepolia | 421614   | ✅      |
| Optimism         | 10       | -       |
| Optimism Sepolia | 11155420 | ✅      |
| Polygon          | 137      | -       |
| Polygon Amoy     | 80002    | ✅      |

### Supported Tokens

Currently includes **USDC** on all chains above.

### ⚠️ Important: Base Network Domain Names

USDC has **different EIP-712 domain names** on Base networks:

| Network      | Chain ID | Domain Name  |
| ------------ | -------- | ------------ |
| Base Mainnet | 8453     | `"USD Coin"` |
| Base Sepolia | 84532    | `"USDC"`     |

The registry handles this automatically. Always use the registry to ensure correct domain parameters.

## Complete Example

```typescript
import {
  buildTypedData,
  buildMessage,
  nowPlusSeconds,
  verifySignature,
} from "@seapay-ai/erc3009";
import { Wallet } from "ethers";

// Create wallet
const wallet = new Wallet("0x...");

// Build message
const message = buildMessage({
  from: wallet.address,
  to: "0xRecipient...",
  value: 1000000n, // 1 USDC
  validBefore: nowPlusSeconds(300), // 5 minutes
});

// Build typed data
const {
  domain,
  types,
  message: msg,
} = buildTypedData({
  chainId: 84532, // Base Sepolia
  token: "USDC",
  message,
});

// Sign
const signature = await wallet.signTypedData(domain, types, msg);

// Verify
const isValid = verifySignature(domain, message, signature, wallet.address);
console.log("Signature valid:", isValid);
```

## API Reference

### Build Functions

- **`buildMessage(params)`** - Create TransferWithAuthorization message
- **`buildTypedData(params)`** - Create complete EIP-712 typed data with domain resolution

### Domain Resolution

- **`resolveDomain(chainId, token, domainOverrides?)`** - Resolve EIP-712 domain from chain and token

### Verification Functions

- **`verifySignature(domain, message, signature, expectedSigner)`** - Verify signature
- **`recoverSigner(domain, message, signature)`** - Recover signer address

### Registry Functions

- **`getTokenInfo(symbol, chainId)`** - Get token configuration
- **`registry.getToken(symbol, chainId)`** - Get token config
- **`registry.getChain(chainId)`** - Get chain config
- **`registry.listChains()`** - List all chains
- **`registry.listChainIds()`** - List all chain IDs
- **`registry.isSupported(symbol, chainId)`** - Check if token is supported
- **`registry.listTokensOnChain(chainId)`** - List tokens on a chain

### Utility Functions

- **`randomNonce()`** - Generate random bytes32 nonce
- **`nowPlusSeconds(seconds)`** - Get Unix timestamp N seconds from now
- **`nowSeconds()`** - Get current Unix timestamp

## TypeScript Types

```typescript
import type {
  TransferWithAuthorization,
  EIP712Domain,
  TypedData,
  TokenConfig,
  ChainConfig,
} from "@seapay-ai/erc3009";
```

## License

Apache-2.0
