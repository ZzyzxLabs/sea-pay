import { getAddress } from "ethers";

/**
 * Normalize an Ethereum address to checksum format
 */
export function normalizeAddress(address: string): string {
  return getAddress(address);
}

/**
 * Generate a nonce key for replay protection
 * Format: chainId|token|from|nonce
 */
export function nonceKey(
  chainId: number,
  token: string,
  from: string,
  nonce: string
): string {
  return `${chainId}|${normalizeAddress(token)}|${normalizeAddress(
    from
  )}|${nonce.toLowerCase()}`;
}
