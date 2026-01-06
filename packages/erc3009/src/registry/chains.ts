import type { ChainConfig } from "../types/registry.js";

/**
 * Chain registry with metadata for supported chains
 */
export const CHAINS: Record<number, ChainConfig> = {
  // Ethereum Mainnet
  1: {
    chainId: 1,
    name: "Ethereum",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    blockExplorerUrls: ["https://etherscan.io"],
  },
  // Ethereum Sepolia Testnet
  11155111: {
    chainId: 11155111,
    name: "Sepolia",
    nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
    blockExplorerUrls: ["https://sepolia.etherscan.io"],
    testnet: true,
  },
  // Base Mainnet
  8453: {
    chainId: 8453,
    name: "Base",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    blockExplorerUrls: ["https://basescan.org"],
  },
  // Base Sepolia Testnet
  84532: {
    chainId: 84532,
    name: "Base Sepolia",
    nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
    blockExplorerUrls: ["https://sepolia.basescan.org"],
    testnet: true,
  },
  // Arbitrum One
  42161: {
    chainId: 42161,
    name: "Arbitrum One",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    blockExplorerUrls: ["https://arbiscan.io"],
  },
  // Arbitrum Sepolia Testnet
  421614: {
    chainId: 421614,
    name: "Arbitrum Sepolia",
    nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
    blockExplorerUrls: ["https://sepolia.arbiscan.io"],
    testnet: true,
  },
  // Polygon
  137: {
    chainId: 137,
    name: "Polygon",
    nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
    blockExplorerUrls: ["https://polygonscan.com"],
  },
  // Polygon Amoy Testnet
  80002: {
    chainId: 80002,
    name: "Polygon Amoy",
    nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
    blockExplorerUrls: ["https://amoy.polygonscan.com"],
    testnet: true,
  },
  // Optimism
  10: {
    chainId: 10,
    name: "Optimism",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    blockExplorerUrls: ["https://optimistic.etherscan.io"],
  },
  // Optimism Sepolia Testnet
  11155420: {
    chainId: 11155420,
    name: "Optimism Sepolia",
    nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
    blockExplorerUrls: ["https://sepolia-optimism.etherscan.io"],
    testnet: true,
  },
};

/**
 * Get chain configuration by chainId
 */
export function getChain(chainId: number): ChainConfig | undefined {
  return CHAINS[chainId];
}

/**
 * List all supported chain IDs
 */
export function listChainIds(): number[] {
  return Object.keys(CHAINS).map(Number);
}

/**
 * List all supported chains
 */
export function listChains(): ChainConfig[] {
  return Object.values(CHAINS);
}

/**
 * Check if chain is supported
 */
export function isChainSupported(chainId: number): boolean {
  return chainId in CHAINS;
}

