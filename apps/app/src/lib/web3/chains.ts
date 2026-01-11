import { mainnet, sepolia, base, baseSepolia, polygon, polygonAmoy } from 'wagmi/chains'

export const chains = [mainnet, sepolia, base, baseSepolia, polygon, polygonAmoy] as const;

// Use one primary RPC per chain (Alchemy/Infura/QuickNode/etc.)
export const rpcUrls: Record<number, string> = {
  [mainnet.id]: process.env.NEXT_PUBLIC_MAINNET_RPC_URL!,
  [sepolia.id]: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL!,
  [baseSepolia.id]: process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL!,
  [polygonAmoy.id]: process.env.NEXT_PUBLIC_POLYGON_AMOY_RPC_URL!,
  [polygon.id]: process.env.NEXT_PUBLIC_POLYGON_RPC_URL!,
  [base.id]: process.env.NEXT_PUBLIC_BASE_RPC_URL!,
};
