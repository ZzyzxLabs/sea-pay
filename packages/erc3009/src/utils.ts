import { randomBytes, hexlify } from "ethers";

/**
 * Generate a random bytes32 nonce for TransferWithAuthorization
 */
export function randomNonce(): string {
  return hexlify(randomBytes(32));
}

/**
 * Get current Unix timestamp + N seconds (for validBefore)
 */
export function nowPlusSeconds(seconds: number): bigint {
  return BigInt(Math.floor(Date.now() / 1000) + seconds);
}

/**
 * Get current Unix timestamp in seconds
 */
export function nowSeconds(): bigint {
  return BigInt(Math.floor(Date.now() / 1000));
}
