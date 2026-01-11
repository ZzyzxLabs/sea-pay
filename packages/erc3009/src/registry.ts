import type { TokenConfig, ChainConfig } from "./types/index.js";

/**
 * Chain registry - supported chains
 */
export const CHAINS: Record<number, ChainConfig> = {
  1: { chainId: 1, name: "Ethereum", testnet: false },
  11155111: { chainId: 11155111, name: "Sepolia", testnet: true },
  8453: { chainId: 8453, name: "Base", testnet: false },
  84532: { chainId: 84532, name: "Base Sepolia", testnet: true },
  42161: { chainId: 42161, name: "Arbitrum One", testnet: false },
  421614: { chainId: 421614, name: "Arbitrum Sepolia", testnet: true },
  10: { chainId: 10, name: "Optimism", testnet: false },
  11155420: { chainId: 11155420, name: "Optimism Sepolia", testnet: true },
  137: { chainId: 137, name: "Polygon", testnet: false },
  80002: { chainId: 80002, name: "Polygon Amoy", testnet: true },
};

/**
 * Token registry - USDC addresses and domain parameters per chain
 * Note: Base mainnet uses "USD Coin" while Base Sepolia uses "USDC"
 */
export const TOKENS: Record<string, Record<number, TokenConfig>> = {
  USDC: {
    // Ethereum
    1: {
      symbol: "USDC",
      chainId: 1,
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      name: "USD Coin",
      version: "2",
      decimals: 6,
    },
    11155111: {
      symbol: "USDC",
      chainId: 11155111,
      address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
      name: "USD Coin",
      version: "2",
      decimals: 6,
    },
    // Base
    8453: {
      symbol: "USDC",
      chainId: 8453,
      address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      name: "USD Coin", // Important: Base mainnet uses "USD Coin"
      version: "2",
      decimals: 6,
    },
    84532: {
      symbol: "USDC",
      chainId: 84532,
      address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      name: "USDC", // Important: Base Sepolia uses "USDC"
      version: "2",
      decimals: 6,
    },
    // Arbitrum
    42161: {
      symbol: "USDC",
      chainId: 42161,
      address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
      name: "USD Coin",
      version: "2",
      decimals: 6,
    },
    421614: {
      symbol: "USDC",
      chainId: 421614,
      address: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
      name: "USD Coin",
      version: "2",
      decimals: 6,
    },
    // Optimism
    10: {
      symbol: "USDC",
      chainId: 10,
      address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
      name: "USD Coin",
      version: "2",
      decimals: 6,
    },
    11155420: {
      symbol: "USDC",
      chainId: 11155420,
      address: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7",
      name: "USD Coin",
      version: "2",
      decimals: 6,
    },
    // Polygon
    137: {
      symbol: "USDC",
      chainId: 137,
      address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
      name: "USD Coin",
      version: "2",
      decimals: 6,
    },
    80002: {
      symbol: "USDC",
      chainId: 80002,
      address: "0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582",
      name: "USD Coin",
      version: "2",
      decimals: 6,
    },
  },
};

/**
 * Get token information for a given chain
 */
export function getTokenInfo(
  tokenSymbol: string,
  chainId: number
): TokenConfig | null {
  const token = TOKENS[tokenSymbol.toUpperCase()];
  if (!token) return null;

  const config = token[chainId];
  return config || null;
}

/**
 * Registry utilities
 */
export const registry = {
  /**
   * Get token configuration
   */
  getToken: (symbol: string, chainId: number): TokenConfig | null => {
    return getTokenInfo(symbol, chainId);
  },

  /**
   * Get chain configuration
   */
  getChain: (chainId: number): ChainConfig | null => {
    return CHAINS[chainId] || null;
  },

  /**
   * List all supported chains
   */
  listChains: (): ChainConfig[] => {
    return Object.values(CHAINS);
  },

  /**
   * List all supported chain IDs
   */
  listChainIds: (): number[] => {
    return Object.keys(CHAINS).map(Number);
  },

  /**
   * Check if a token is supported on a chain
   */
  isSupported: (symbol: string, chainId: number): boolean => {
    return getTokenInfo(symbol, chainId) !== null;
  },

  /**
   * List all tokens on a chain
   */
  listTokensOnChain: (chainId: number): TokenConfig[] => {
    const tokens: TokenConfig[] = [];
    for (const symbol of Object.keys(TOKENS)) {
      const config = TOKENS[symbol][chainId];
      if (config) {
        tokens.push(config);
      }
    }
    return tokens;
  },
} as const;
