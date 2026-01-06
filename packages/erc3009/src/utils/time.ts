/**
 * Get current Unix timestamp in seconds
 */
export function nowSeconds(): bigint {
  return BigInt(Math.floor(Date.now() / 1000));
}

/**
 * Get Unix timestamp N seconds from now
 */
export function nowPlusSeconds(seconds: number): bigint {
  return nowSeconds() + BigInt(seconds);
}

/**
 * Convert seconds to bigint
 */
export function toBigInt(value: number | bigint | string): bigint {
  return BigInt(value);
}
