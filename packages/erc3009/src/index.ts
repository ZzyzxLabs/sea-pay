/**
 * @seapay/erc3009
 *
 * Multi-chain ERC-3009 (TransferWithAuthorization) helper library
 * for building, signing, and verifying EIP-712 typed data.
 */

// === Types ===
export type {
  TransferWithAuthorization,
  EIP712Domain,
  DomainOverrides,
  ResolveDomainParams,
  ChainConfig,
  TokenConfig,
  TokenRegistry,
} from "./types/index.js";

// === Core ERC-3009 Namespace ===
export { erc3009 } from "./core.js";

// === Core Functions (individual exports) ===
export {
  buildTypes,
  buildMessage,
  buildMessageWithTTL,
  buildTypedData,
  signTransferWithAuthorization,
  recoverSigner,
  verifySignature,
  TRANSFER_WITH_AUTHORIZATION_TYPE,
  PRIMARY_TYPE,
} from "./erc3009/index.js";

// === Domain Resolution ===
export {
  resolveDomain,
  resolveDomainFromToken,
  normalizeAddress,
  normalizeChainId,
} from "./domain/index.js";

// === Registry ===
export {
  // Chains
  CHAINS,
  getChain,
  listChains,
  listChainIds,
  isChainSupported,
  // Tokens
  TOKENS,
  USDC,
  getUSDC,
  isUSDCSupported,
  listUSDCChains,
  listTokenSymbols,
  // Registry lookup
  getToken,
  getTokenByAddress,
  listTokensOnChain,
  isTokenSupported,
} from "./registry/index.js";

// === Utils ===
export {
  randomNonce,
  nowSeconds,
  nowPlusSeconds,
  toBigInt,
  ensureHex,
  isBytes32Hex,
} from "./utils/index.js";

// === Ergonomic API ===
export { prepare } from "./api/index.js";
export type { PrepareParams, PrepareResult } from "./api/prepare.js";

// === Registry object (for namespaced access) ===
import * as registryFunctions from "./registry/registry.js";
export const registry = {
  getToken: registryFunctions.getToken,
  getTokenByAddress: registryFunctions.getTokenByAddress,
  getChain: registryFunctions.getChain,
  listChains: registryFunctions.listChains,
  listChainIds: registryFunctions.listChainIds,
  listTokenSymbols: registryFunctions.listTokenSymbols,
  listTokensOnChain: registryFunctions.listTokensOnChain,
  isTokenSupported: registryFunctions.isTokenSupported,
  isChainSupported: registryFunctions.isChainSupported,
} as const;
