# @seapay-ai/erc3009

TypeScript utilities for ERC-3009 (Transfer With Authorization) EIP-712 signing.

## Installation

```bash
npm install @seapay-ai/erc3009
# or
pnpm add @seapay-ai/erc3009
# or
yarn add @seapay-ai/erc3009
```

## Usage

### Basic Example

```typescript
import { Wallet } from "ethers";
import {
  buildTypedData,
  buildTypes,
  message_5_minutes,
  signTransferWithAuthorization,
  type EIP712Domain,
  type TransferWithAuthorization,
} from "@seapay-ai/erc3009";

// Create a wallet
const wallet = new Wallet("0x...");

// Define the token domain (EIP-712 domain)
const domain: EIP712Domain = {
  name: "USD Coin",
  version: "2",
  chainId: 84532, // Base Sepolia
  verifyingContract: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
};

// Create a transfer authorization message
const message = message_5_minutes(
  wallet.address, // from
  "0x...", // to
  BigInt("1000000") // value (1 USDC if 6 decimals)
);

// Sign the authorization
const signature = await signTransferWithAuthorization(wallet, domain, message);

// Or build typed data manually
const typedData = buildTypedData({ domain, message });
const types = buildTypes();
// Use with wallet.signTypedData(typedData.domain, types, typedData.message)
```

### API Reference

#### Types

- `TransferWithAuthorization`: The message structure for ERC-3009 transfers
- `EIP712Domain`: The EIP-712 domain structure

#### Functions

- `buildDomain(domain: EIP712Domain)`: Converts EIP712Domain to TypedDataDomain
- `buildTypes()`: Returns the EIP-712 types for TransferWithAuthorization
- `buildMessage(message: TransferWithAuthorization)`: Normalizes message values
- `buildTypedData(params)`: Builds complete typed data for signing
- `signTransferWithAuthorization(wallet, domain, message)`: Convenience function to sign
- `message_5_minutes(from, to, value)`: Creates a message valid for 5 minutes
- `USDC_Domain()`: Returns USDC domain for Base Sepolia (example)

## Requirements

- Node.js 18+
- ethers v6

## License

Apache-2.0
