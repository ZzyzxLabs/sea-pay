/**
 * @seapay-ai/erc3009
 *
 * Simplified ERC-3009 (TransferWithAuthorization) library
 * for building, signing, and verifying EIP-712 typed data.
 */

// === Core Types ===
export type {
  TransferWithAuthorization,
  EIP712Domain,
  TypedData,
  TokenConfig,
  ChainConfig,
} from "./types/index.js";

// === Registry ===
export { registry, getTokenInfo } from "./registry.js";

// === Domain Resolution ===
export { resolveDomain } from "./domain.js";

// === Build Functions ===
export { buildTypedData, buildMessage } from "./build.js";

// === Verify Functions ===
export { verifySignature, recoverSigner } from "./verify.js";

// === Utils ===
export { randomNonce, nowPlusSeconds } from "./utils.js";
