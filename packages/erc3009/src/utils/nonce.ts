import { randomBytes, hexlify } from "ethers";

/**
 * Generate a random bytes32 nonce (hex string)
 */
export function randomNonce(): string {
  return hexlify(randomBytes(32));
}
