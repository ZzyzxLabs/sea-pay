import { JsonRpcProvider, Wallet } from "ethers";
import {
  SUPPORTED_CHAINS,
  type SupportedChainId,
  requiredEnv,
} from "./config.js";

// Get RPC URL for a chain ID
export function getRpcUrl(chainId: number): string {
  const envKey = `RPC_URL_${chainId}`;
  const rpcUrl = process.env[envKey];
  if (!rpcUrl) {
    throw new Error(
      `Missing RPC_URL_${chainId} environment variable for chain ${chainId}`
    );
  }
  return rpcUrl;
}

// Provider cache - create providers on demand
const providerCache = new Map<number, JsonRpcProvider>();

export function getProvider(chainId: number): JsonRpcProvider {
  if (!providerCache.has(chainId)) {
    const rpcUrl = getRpcUrl(chainId);
    const provider = new JsonRpcProvider(rpcUrl);
    providerCache.set(chainId, provider);
  }
  return providerCache.get(chainId)!;
}

// Relayer wallet cache - one per chain
const relayerCache = new Map<number, Wallet>();

export function getRelayer(chainId: number): Wallet {
  if (!relayerCache.has(chainId)) {
    const relayerPk = requiredEnv("RELAYER_PK");
    const provider = getProvider(chainId);
    const relayer = new Wallet(relayerPk, provider);
    relayerCache.set(chainId, relayer);
  }
  return relayerCache.get(chainId)!;
}

// Check if chain is supported
export function isSupportedChain(chainId: number): boolean {
  return Object.values(SUPPORTED_CHAINS).includes(chainId as SupportedChainId);
}

// Initialize and log supported chains
export function initializeChains(): void {
  console.log("\n🚀 ERC-3009 Multi-Chain Relay Server");
  console.log("   Supported Chains:");
  for (const [name, chainId] of Object.entries(SUPPORTED_CHAINS)) {
    try {
      const rpcUrl = getRpcUrl(chainId);
      const relayer = getRelayer(chainId);
      console.log(`   - ${name}: ${chainId} (${relayer.address})`);
    } catch (err: any) {
      console.log(
        `   - ${name}: ${chainId} (⚠️  RPC_URL_${chainId} not configured)`
      );
    }
  }
  console.log("");
}
