# @seapay-ai/erc3009

Multi-chain ERC-3009 (TransferWithAuthorization) helper library for building, signing, and verifying EIP-712 typed data.

## Features

- ✅ **Multi-chain support**: Base, Ethereum, Arbitrum, Optimism, Polygon (mainnet + testnets)
- ✅ **Token registry**: Pre-configured USDC addresses and domain parameters for all chains
- ✅ **Type-safe**: Full TypeScript support with strict types
- ✅ **Ergonomic API**: One-liner `prepare()` for common use cases
- ✅ **Override support**: Customize domain parameters for custom tokens
- ✅ **ethers.js v6**: Built on ethers v6 for signing and verification

## Installation

```bash
pnpm add @seapay-ai/erc3009
# or
npm install @seapay-ai/erc3009
```

## Quick Start

```typescript
import { prepare } from "@seapay-ai/erc3009";
import { Wallet } from "ethers";

// One-call convenience API
const { typedData } = prepare({
  chainId: 8453, // Base
  token: "USDC",
  from: wallet.address,
  to: "0xRecipient...",
  value: 1000000n, // 1 USDC (6 decimals)
  ttlSeconds: 300, // 5 minutes
});

// Sign with ethers wallet
const signature = await wallet.signTypedData(
  typedData.domain,
  typedData.types,
  typedData.message
);
```

## Usage Examples

### 1. Ergonomic API (Recommended)

The `prepare()` function resolves the domain, builds the message, and returns everything needed:

```typescript
import { prepare } from "@seapay-ai/erc3009";

const { domain, message, typedData } = prepare({
  chainId: 8453, // Base mainnet
  token: "USDC",
  from: "0xSender...",
  to: "0xRecipient...",
  value: 1000000n, // 1 USDC
  ttlSeconds: 300, // optional, default: 300
});

// Sign it
const sig = await wallet.signTypedData(
  typedData.domain,
  typedData.types,
  typedData.message
);
```

### 2. Core Builders (Manual)

For more control, use the core builders:

```typescript
import {
  resolveDomain,
  buildMessage,
  buildTypedData,
  erc3009,
} from "@seapay-ai/erc3009";

// 1. Resolve domain from registry
const domain = resolveDomain({
  chainId: 8453,
  token: "USDC",
});

// 2. Build message
const message = buildMessage({
  from: "0xSender...",
  to: "0xRecipient...",
  value: 1000000n,
  validAfter: 0n,
  validBefore: 1234567890n,
  nonce: "0x...", // or use randomNonce()
});

// 3. Build typed data
const typedData = buildTypedData({ domain, message });

// 4. Sign
const signature = await erc3009.sign(wallet, domain, message);
```

### 3. Using the Registry

Query supported chains and tokens:

```typescript
import { registry, getToken, CHAINS } from "@seapay-ai/erc3009";

// Get token config
const usdcBase = getToken("USDC", 8453);
// => { symbol: "USDC", chainId: 8453, verifyingContract: "0x...", ... }

// List all chains
const chains = registry.listChains();

// Check support
if (registry.isTokenSupported("USDC", 8453)) {
  console.log("USDC is supported on Base");
}

// List tokens on a chain
const tokens = registry.listTokensOnChain(8453);
```

### 4. Custom Tokens / Domain Overrides

For custom tokens not in the registry:

```typescript
import { prepare } from "@seapay-ai/erc3009";

const { typedData } = prepare({
  chainId: 8453,
  token: "0xCustomTokenAddress",
  // Override domain fields
  name: "My Custom Token",
  version: "1",
  verifyingContract: "0xCustomTokenAddress",
  from: "0xSender...",
  to: "0xRecipient...",
  value: 1000000n,
});
```

### 5. Signature Verification

```typescript
import { verifySignature, recoverSigner } from "@seapay-ai/erc3009";

// Recover signer
const recovered = recoverSigner(domain, message, signature);
console.log("Signed by:", recovered);

// Verify signature
const isValid = verifySignature(
  domain,
  message,
  signature,
  expectedSigner
);
```

## Supported Chains

| Chain | Chain ID | Testnet |
|-------|----------|---------|
| Ethereum | 1 | - |
| Sepolia | 11155111 | ✅ |
| Base | 8453 | - |
| Base Sepolia | 84532 | ✅ |
| Arbitrum One | 42161 | - |
| Arbitrum Sepolia | 421614 | ✅ |
| Optimism | 10 | - |
| Optimism Sepolia | 11155420 | ✅ |
| Polygon | 137 | - |
| Polygon Amoy | 80002 | ✅ |

## Supported Tokens

Currently supports **USDC** on all chains above. The registry includes:
- Proxy contract addresses
- EIP-712 domain parameters (name, version)
- Token decimals

## API Reference

### Core Functions

- `prepare(params)` - One-call API to build everything
- `buildMessage(params)` - Build TransferWithAuthorization message
- `buildTypedData({ domain, message })` - Build EIP-712 typed data
- `resolveDomain({ chainId, token, ...overrides })` - Resolve EIP-712 domain
- `erc3009.sign(wallet, domain, message)` - Sign with ethers wallet
- `verifySignature(domain, message, sig, signer)` - Verify signature
- `recoverSigner(domain, message, sig)` - Recover signer address

### Registry

- `registry.getToken(symbol, chainId)` - Get token config
- `registry.getChain(chainId)` - Get chain config
- `registry.listChains()` - List all supported chains
- `registry.listTokensOnChain(chainId)` - List tokens on a chain
- `registry.isTokenSupported(symbol, chainId)` - Check support

### Utils

- `randomNonce()` - Generate random bytes32 nonce
- `nowSeconds()` - Current Unix timestamp
- `nowPlusSeconds(n)` - Unix timestamp N seconds from now
- `normalizeAddress(addr)` - Normalize to checksum address

## TypeScript Types

```typescript
import type {
  TransferWithAuthorization,
  EIP712Domain,
  TokenConfig,
  ChainConfig,
  PrepareParams,
} from "@seapay-ai/erc3009";
```

## Advanced: Custom Registry

You can extend the registry by directly importing and modifying `TOKENS`:

```typescript
import { TOKENS } from "@seapay-ai/erc3009";

// Add your custom token
TOKENS["MYTOKEN"] = {
  8453: {
    symbol: "MYTOKEN",
    chainId: 8453,
    verifyingContract: "0x...",
    name: "My Token",
    version: "1",
    decimals: 18,
  },
};
```

## Examples

See the `/apps/erc3009-relay/src/signer-test.ts` in the monorepo for a complete working example.

## Contributing

Contributions welcome! To add support for a new token:

1. Add token config to `src/registry/tokens/{token}.ts`
2. Export from `src/registry/tokens/index.ts`
3. Add to `TOKENS` registry

## License

Apache-2.0
