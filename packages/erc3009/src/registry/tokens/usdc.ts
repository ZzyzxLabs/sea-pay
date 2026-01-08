import type { TokenConfig } from "../../types/registry.js";

/**
 * USDC token configurations across supported chains
 *
 * Note: These are the proxy addresses and EIP-712 domain parameters
 * for the USDC contract on each chain.
 *
 * **IMPORTANT**: Domain names vary by network:
 * - Base Mainnet (8453): name = "USD Coin"
 * - Base Sepolia (84532): name = "USDC"
 *
 * Always use the correct domain name for signature verification to work.
 */
export const USDC: Record<number, TokenConfig> = {
  // Ethereum Mainnet
  1: {
    symbol: "USDC",
    chainId: 1,
    verifyingContract: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    name: "USD Coin",
    version: "2",
    decimals: 6,
  },
  // Ethereum Sepolia Testnet
  11155111: {
    symbol: "USDC",
    chainId: 11155111,
    verifyingContract: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    name: "USD Coin",
    version: "2",
    decimals: 6,
  },
  // Base Mainnet (domain name: "USD Coin")
  8453: {
    symbol: "USDC",
    chainId: 8453,
    verifyingContract: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    name: "USD Coin",
    version: "2",
    decimals: 6,
  },
  // Base Sepolia Testnet (domain name: "USDC")
  84532: {
    symbol: "USDC",
    chainId: 84532,
    verifyingContract: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    name: "USDC",
    version: "2",
    decimals: 6,
  },
  // Arbitrum One
  42161: {
    symbol: "USDC",
    chainId: 42161,
    verifyingContract: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    name: "USD Coin",
    version: "2",
    decimals: 6,
  },
  // Arbitrum Sepolia Testnet
  421614: {
    symbol: "USDC",
    chainId: 421614,
    verifyingContract: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
    name: "USD Coin",
    version: "2",
    decimals: 6,
  },
  // Polygon
  137: {
    symbol: "USDC",
    chainId: 137,
    verifyingContract: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    name: "USD Coin",
    version: "2",
    decimals: 6,
  },
  // Optimism
  10: {
    symbol: "USDC",
    chainId: 10,
    verifyingContract: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
    name: "USD Coin",
    version: "2",
    decimals: 6,
  },
};

/**
 * Get USDC configuration for a specific chain
 */
export function getUSDC(chainId: number): TokenConfig | undefined {
  return USDC[chainId];
}

/**
 * Check if USDC is supported on a chain
 */
export function isUSDCSupported(chainId: number): boolean {
  return chainId in USDC;
}

/**
 * List all chains where USDC is configured
 */
export function listUSDCChains(): number[] {
  return Object.keys(USDC).map(Number);
}
