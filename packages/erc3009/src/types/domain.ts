/**
 * EIP-712 Domain structure
 */
export type EIP712Domain = {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
};

/**
 * Partial domain for overrides
 */
export type DomainOverrides = Partial<EIP712Domain>;

/**
 * Domain resolution parameters
 */
export type ResolveDomainParams = {
  chainId: number;
  token: string; // token symbol like "USDC" or explicit address
  // Optional overrides
  name?: string;
  version?: string;
  verifyingContract?: string;
};
