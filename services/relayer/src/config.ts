import path from "path";
import dotenv from "dotenv";
import { getAddress } from "ethers";

// Load env from current working dir (root run) and monorepo root (when cwd is services/relayer)
const envPaths = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "..", "..", ".env"),
];
for (const envPath of envPaths) {
  dotenv.config({ path: envPath });
}

// Supported chain IDs
export const SUPPORTED_CHAINS = {
  BASE: 8453,
  BASE_SEPOLIA: 84532,
  POLYGON: 137,
  POLYGON_AMOY: 80002,
} as const;

export type SupportedChainId =
  (typeof SUPPORTED_CHAINS)[keyof typeof SUPPORTED_CHAINS];

// Contract ABIs
export const ERC3009_ABI = [
  "function DOMAIN_SEPARATOR() view returns (bytes32)",
  "function transferWithAuthorization(address,address,uint256,uint256,uint256,bytes32,uint8,bytes32,bytes32)",
];

export const ERC20_ABI = [
  "function name() view returns (string)",
  "function version() view returns (string)",
];

// Token allowlist configuration
export interface TokenAllowlistConfig {
  // Global allowlist (applies to all chains)
  global?: Set<string>;
  // Chain-specific allowlists
  chainSpecific?: Map<number, Set<string>>;
}

function normalizeAddress(address: string): string {
  return getAddress(address);
}

export function parseTokenAllowlist(): TokenAllowlistConfig {
  const config: TokenAllowlistConfig = {};

  // Parse global allowlist
  const globalAllowlist = process.env.TOKEN_ALLOWLIST;
  if (globalAllowlist) {
    config.global = new Set(
      globalAllowlist
        .split(",")
        .map((v) => normalizeAddress(v.trim()))
        .filter(Boolean)
    );
  }

  // Parse chain-specific allowlists
  config.chainSpecific = new Map();
  for (const chainId of Object.values(SUPPORTED_CHAINS)) {
    const envKey = `TOKEN_ALLOWLIST_${chainId}`;
    const chainAllowlist = process.env[envKey];
    if (chainAllowlist) {
      config.chainSpecific.set(
        chainId,
        new Set(
          chainAllowlist
            .split(",")
            .map((v) => normalizeAddress(v.trim()))
            .filter(Boolean)
        )
      );
    }
  }

  return config;
}

export const tokenAllowlist = parseTokenAllowlist();

export function isAllowedToken(token: string, chainId: number): boolean {
  const normalized = normalizeAddress(token);

  // Check chain-specific allowlist first
  if (tokenAllowlist.chainSpecific?.has(chainId)) {
    const chainList = tokenAllowlist.chainSpecific.get(chainId)!;
    return chainList.has(normalized);
  }

  // Check global allowlist
  if (tokenAllowlist.global) {
    return tokenAllowlist.global.has(normalized);
  }

  // If no allowlist configured, allow all (not recommended for production)
  return true;
}

/**
 * Get required environment variable or throw
 */
export function requiredEnv(key: string): string {
  const val = process.env[key];
  if (!val) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return val;
}
