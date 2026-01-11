import type { EIP712Domain } from "./types/index.js";
import { getTokenInfo } from "./registry.js";

/**
 * Resolve EIP-712 domain from chain ID and token
 *
 * @param chainId - Chain ID (e.g. 8453 for Base)
 * @param token - Token symbol (e.g. "USDC") or contract address (0x...)
 * @param domainOverrides - Optional domain parameter overrides for custom tokens
 * @returns EIP-712 Domain object
 *
 * @example
 * // Resolve USDC on Base
 * const domain = resolveDomain(8453, "USDC");
 * // Returns:
 * // {
 * //   name: "USD Coin",
 * //   version: "2",
 * //   chainId: 8453,
 * //   verifyingContract: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
 * // }
 *
 * @example
 * // Resolve custom token with overrides
 * const domain = resolveDomain(8453, "0x123...", {
 *   name: "My Token",
 *   version: "1"
 * });
 */
export function resolveDomain(
  chainId: number,
  token: string,
  domainOverrides?: Partial<EIP712Domain>
): EIP712Domain {
  let domain: EIP712Domain;

  if (token.startsWith("0x")) {
    // Custom token address - use overrides or fail
    if (!domainOverrides?.name || !domainOverrides?.verifyingContract) {
      throw new Error(
        "Custom token address requires domain overrides (name, verifyingContract)"
      );
    }
    domain = {
      name: domainOverrides.name,
      version: domainOverrides.version ?? "1",
      chainId,
      verifyingContract: domainOverrides.verifyingContract,
    };
  } else {
    // Try registry lookup
    const tokenInfo = getTokenInfo(token, chainId);
    if (!tokenInfo) {
      throw new Error(
        `Token ${token} not found in registry for chain ${chainId}. Use domainOverrides for custom tokens.`
      );
    }

    domain = {
      name: tokenInfo.name,
      version: tokenInfo.version,
      chainId: tokenInfo.chainId,
      verifyingContract: tokenInfo.address,
      ...domainOverrides, // Allow overriding registry values
    };
  }

  return domain;
}
