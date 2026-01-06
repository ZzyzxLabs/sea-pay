/**
 * Chain metadata
 */
export type ChainConfig = {
  chainId: number;
  name: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls?: string[];
  blockExplorerUrls?: string[];
  testnet?: boolean;
};

/**
 * Token configuration for a specific chain
 */
export type TokenConfig = {
  symbol: string;
  chainId: number;
  verifyingContract: `0x${string}`; // proxy address
  name: string; // EIP-712 domain name
  version: string; // EIP-712 domain version
  decimals?: number;
};

/**
 * Token registry (symbol -> chainId -> config)
 */
export type TokenRegistry = {
  [symbol: string]: {
    [chainId: number]: TokenConfig;
  };
};

