/**
 * Ensure hex string has 0x prefix
 */
export function ensureHex(value: string): string {
  return value.startsWith("0x") ? value : `0x${value}`;
}

/**
 * Normalize address to lowercase with 0x prefix
 */
export function normalizeAddress(address: string): string {
  return ensureHex(address.toLowerCase());
}

/**
 * Check if string is valid bytes32 hex
 */
export function isBytes32Hex(value: string): boolean {
  const hex = ensureHex(value);
  return /^0x[0-9a-fA-F]{64}$/.test(hex);
}
