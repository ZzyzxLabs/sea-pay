import type { EIP712Domain, ResolveDomainParams } from "../types/domain.js";
import { getToken, getTokenByAddress } from "../registry/registry.js";
import { normalizeAddress, normalizeChainId } from "./normalize.js";

/**
 * Resolve EIP-712 domain from chain + token with override support
 * 
 * Priority:
 * 1. Explicit overrides (name, version, verifyingContract)
 * 2. Registry lookup (by symbol or address)
 * 3. Error if cannot resolve
 */
export function resolveDomain(params: ResolveDomainParams): EIP712Domain {
  const chainId = normalizeChainId(params.chainId);

  // Try registry lookup
  let config = getToken(params.token, chainId);

  // If not found by symbol, try as address
  if (!config && params.token.startsWith("0x")) {
    config = getTokenByAddress(params.token, chainId);
  }

  // If still not found and no explicit verifyingContract, error
  if (!config && !params.verifyingContract) {
    throw new Error(
      `Token "${params.token}" not found in registry for chainId ${chainId}. ` +
        `Provide explicit domain parameters or use a supported token.`
    );
  }

  // Build domain with overrides
  const domain: EIP712Domain = {
    name: params.name ?? config?.name ?? "USD Coin",
    version: params.version ?? config?.version ?? "2",
    chainId,
    verifyingContract: normalizeAddress(
      params.verifyingContract ?? config?.verifyingContract ?? params.token
    ),
  };

  return domain;
}

/**
 * Resolve domain from token config only (no overrides)
 */
export function resolveDomainFromToken(
  symbol: string,
  chainId: number
): EIP712Domain {
  const config = getToken(symbol, chainId);
  if (!config) {
    throw new Error(
      `Token "${symbol}" not configured for chainId ${chainId}`
    );
  }

  return {
    name: config.name,
    version: config.version,
    chainId: config.chainId,
    verifyingContract: config.verifyingContract,
  };
}

