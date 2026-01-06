# ERC-3009 Usage Examples

Complete examples for common use cases.

## 1. Basic Transfer (Recommended)

Use the `prepare()` API for the simplest experience:

```typescript
import { prepare } from "@seapay-ai/erc3009";
import { Wallet } from "ethers";

const wallet = new Wallet(privateKey);

// Prepare typed data for Base mainnet USDC
const { typedData } = prepare({
  chainId: 8453, // Base
  token: "USDC",
  from: wallet.address,
  to: "0xRecipientAddress",
  value: 1000000n, // 1 USDC (6 decimals)
  ttlSeconds: 300, // 5 minutes
});

// Sign
const signature = await wallet.signTypedData(
  typedData.domain,
  typedData.types,
  typedData.message
);

console.log("Signature:", signature);
```

## 2. Different Chains

```typescript
import { prepare } from "@seapay-ai/erc3009";

// Ethereum mainnet
const eth = prepare({
  chainId: 1,
  token: "USDC",
  from: "0x...",
  to: "0x...",
  value: 1000000n,
});

// Base mainnet
const base = prepare({
  chainId: 8453,
  token: "USDC",
  from: "0x...",
  to: "0x...",
  value: 1000000n,
});

// Arbitrum One
const arb = prepare({
  chainId: 42161,
  token: "USDC",
  from: "0x...",
  to: "0x...",
  value: 1000000n,
});
```

## 3. Custom Token

For tokens not in the registry:

```typescript
import { prepare } from "@seapay-ai/erc3009";

const { typedData } = prepare({
  chainId: 8453,
  token: "0xCustomTokenAddress",
  // Override domain fields
  name: "My Custom Token",
  version: "1",
  verifyingContract: "0xCustomTokenAddress",
  from: wallet.address,
  to: recipient,
  value: 1000000000000000000n, // 1 token (18 decimals)
});
```

## 4. Manual Building (Advanced)

For full control over each step:

```typescript
import {
  resolveDomain,
  buildMessage,
  buildTypedData,
  randomNonce,
  nowPlusSeconds,
} from "@seapay-ai/erc3009";
import { Wallet } from "ethers";

const wallet = new Wallet(privateKey);

// 1. Resolve domain from registry
const domain = resolveDomain({
  chainId: 8453,
  token: "USDC",
});

// 2. Build message with custom time window
const message = buildMessage({
  from: wallet.address,
  to: "0xRecipient",
  value: 1000000n,
  validAfter: 0n,
  validBefore: nowPlusSeconds(600), // 10 minutes
  nonce: randomNonce(),
});

// 3. Build typed data
const typedData = buildTypedData({ domain, message });

// 4. Sign
const signature = await wallet.signTypedData(
  typedData.domain,
  typedData.types,
  typedData.message
);
```

## 5. Signature Verification

```typescript
import { verifySignature, recoverSigner } from "@seapay-ai/erc3009";

// Method 1: Verify against expected signer
const isValid = verifySignature(
  domain,
  message,
  signature,
  "0xExpectedSigner"
);

if (!isValid) {
  throw new Error("Invalid signature");
}

// Method 2: Recover signer address
const signer = recoverSigner(domain, message, signature);
console.log("Signed by:", signer);
```

## 6. Querying Registry

```typescript
import { registry, getToken, CHAINS, USDC } from "@seapay-ai/erc3009";

// Get token config
const usdcBase = getToken("USDC", 8453);
console.log("USDC on Base:", usdcBase.verifyingContract);

// List all chains
const chains = registry.listChains();
chains.forEach((chain) => {
  console.log(`${chain.name} (${chain.chainId})`);
});

// Check support
if (registry.isTokenSupported("USDC", 8453)) {
  console.log("USDC is supported on Base");
}

// List all tokens on a chain
const tokens = registry.listTokensOnChain(8453);
console.log(`Tokens on Base: ${tokens.map((t) => t.symbol).join(", ")}`);

// Direct access to configs
console.log("All chains:", Object.keys(CHAINS));
console.log("USDC chains:", Object.keys(USDC));
```

## 7. Complete Relay Integration

Full example with relay server integration:

```typescript
import { prepare, verifySignature } from "@seapay-ai/erc3009";
import { Wallet } from "ethers";

async function sendViaRelay() {
  const wallet = new Wallet(process.env.PRIVATE_KEY!);

  // 1. Prepare typed data
  const { domain, message, typedData } = prepare({
    chainId: 8453, // Base
    token: "USDC",
    from: wallet.address,
    to: "0xRecipient",
    value: 1000000n, // 1 USDC
    ttlSeconds: 300,
  });

  // 2. Sign
  const signature = await wallet.signTypedData(
    typedData.domain,
    typedData.types,
    typedData.message
  );

  // 3. Verify locally (optional)
  const isValid = verifySignature(domain, message, signature, wallet.address);
  if (!isValid) {
    throw new Error("Invalid signature");
  }

  // 4. Send to relay server
  const response = await fetch("http://localhost:3001/api/relay", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: domain.verifyingContract,
      from: message.from,
      to: message.to,
      value: message.value.toString(),
      validAfter: message.validAfter.toString(),
      validBefore: message.validBefore.toString(),
      nonce: message.nonce,
      signature,
      domain,
    }),
  });

  const result = await response.json();
  console.log("Transaction hash:", result.txHash);
}
```

## 8. React Hook Example

```typescript
import { useState } from "react";
import { prepare } from "@seapay-ai/erc3009";
import { useWallet } from "./useWallet"; // your wallet hook

export function useERC3009Transfer() {
  const { wallet } = useWallet();
  const [loading, setLoading] = useState(false);

  const transfer = async (params: {
    chainId: number;
    to: string;
    value: bigint;
  }) => {
    if (!wallet) throw new Error("Wallet not connected");

    setLoading(true);
    try {
      const { typedData } = prepare({
        chainId: params.chainId,
        token: "USDC",
        from: wallet.address,
        to: params.to,
        value: params.value,
        ttlSeconds: 300,
      });

      const signature = await wallet.signTypedData(
        typedData.domain,
        typedData.types,
        typedData.message
      );

      // Submit to relay...
      return signature;
    } finally {
      setLoading(false);
    }
  };

  return { transfer, loading };
}
```

## 9. Testing Example

```typescript
import { describe, it, expect } from "vitest";
import { Wallet } from "ethers";
import {
  prepare,
  verifySignature,
  recoverSigner,
} from "@seapay-ai/erc3009";

describe("ERC-3009", () => {
  it("should sign and verify", async () => {
    const wallet = Wallet.createRandom();

    const { domain, message, typedData } = prepare({
      chainId: 8453,
      token: "USDC",
      from: wallet.address,
      to: "0x0000000000000000000000000000000000000001",
      value: 1000000n,
    });

    const signature = await wallet.signTypedData(
      typedData.domain,
      typedData.types,
      typedData.message
    );

    const isValid = verifySignature(
      domain,
      message,
      signature,
      wallet.address
    );
    expect(isValid).toBe(true);

    const recovered = recoverSigner(domain, message, signature);
    expect(recovered.toLowerCase()).toBe(wallet.address.toLowerCase());
  });
});
```

## 10. CLI Tool Example

```typescript
#!/usr/bin/env node
import { prepare } from "@seapay-ai/erc3009";
import { Wallet } from "ethers";

const args = process.argv.slice(2);
const [chainId, to, value] = args;

if (!chainId || !to || !value) {
  console.error("Usage: sign-transfer <chainId> <to> <value>");
  process.exit(1);
}

const wallet = new Wallet(process.env.PRIVATE_KEY!);

const { typedData } = prepare({
  chainId: parseInt(chainId),
  token: "USDC",
  from: wallet.address,
  to,
  value: BigInt(value),
});

const signature = await wallet.signTypedData(
  typedData.domain,
  typedData.types,
  typedData.message
);

console.log(
  JSON.stringify(
    {
      message: typedData.message,
      signature,
      domain: typedData.domain,
    },
    null,
    2
  )
);
```

## More Examples

See the test files in the monorepo:
- `/apps/erc3009-relay/src/signer-test.ts` - Complete relay integration
- `/apps/erc3009-relay/src/server.ts` - Relay server implementation

