export * from "./usdc.js";

import type { TokenRegistry } from "../../types/registry.js";
import { USDC } from "./usdc.js";

/**
 * All token configurations indexed by symbol
 */
export const TOKENS: TokenRegistry = {
  USDC,
};

/**
 * Get all supported token symbols
 */
export function listTokenSymbols(): string[] {
  return Object.keys(TOKENS);
}

