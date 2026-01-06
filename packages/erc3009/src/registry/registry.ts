import type { ChainConfig, TokenConfig } from "../types/registry.js";
import { CHAINS, getChain as getChainConfig } from "./chains.js";
import { TOKENS } from "./tokens/index.js";
import { normalizeAddress } from "../utils/hex.js";

/**
 * Get token configuration by symbol and chainId
 */
export function getToken(
  symbol: string,
  chainId: number
): TokenConfig | undefined {
  const tokenSymbol = symbol.toUpperCase();
  return TOKENS[tokenSymbol]?.[chainId];
}

/**
 * Get token configuration by address (exact match)
 */
export function getTokenByAddress(
  address: string,
  chainId: number
): TokenConfig | undefined {
  const normalized = normalizeAddress(address);
  const tokens = Object.values(TOKENS);

  for (const tokenChains of tokens) {
    const config = tokenChains[chainId];
    if (config && normalizeAddress(config.verifyingContract) === normalized) {
      return config;
    }
  }

  return undefined;
}

/**
 * Get chain configuration
 */
export function getChain(chainId: number): ChainConfig | undefined {
  return getChainConfig(chainId);
}

/**
 * List all chains
 */
export function listChains(): ChainConfig[] {
  return Object.values(CHAINS);
}

/**
 * List all chain IDs
 */
export function listChainIds(): number[] {
  return Object.keys(CHAINS).map(Number);
}

/**
 * List all token symbols
 */
export function listTokenSymbols(): string[] {
  return Object.keys(TOKENS);
}

/**
 * List all tokens on a specific chain
 */
export function listTokensOnChain(chainId: number): TokenConfig[] {
  const result: TokenConfig[] = [];
  for (const tokenChains of Object.values(TOKENS)) {
    const config = tokenChains[chainId];
    if (config) {
      result.push(config);
    }
  }
  return result;
}

/**
 * Check if token is supported on chain
 */
export function isTokenSupported(symbol: string, chainId: number): boolean {
  return getToken(symbol, chainId) !== undefined;
}

/**
 * Check if chain is supported
 */
export function isChainSupported(chainId: number): boolean {
  return chainId in CHAINS;
}

