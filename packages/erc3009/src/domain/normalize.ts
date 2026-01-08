import { getAddress } from "ethers";

/**
 * Normalize address to checksum format
 */
export function normalizeAddress(address: string): string {
  try {
    return getAddress(address);
  } catch {
    // If invalid address, return lowercase with 0x
    return address.toLowerCase().startsWith("0x")
      ? address.toLowerCase()
      : `0x${address.toLowerCase()}`;
  }
}

/**
 * Normalize chainId to number
 */
export function normalizeChainId(chainId: number | bigint | string): number {
  if (typeof chainId === "number") return chainId;
  if (typeof chainId === "bigint") return Number(chainId);
  return parseInt(String(chainId), 10);
}
