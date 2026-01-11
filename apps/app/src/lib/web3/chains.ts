import { mainnet, baseSepolia, base, arbitrum } from 'wagmi/chains'

export const chains = [mainnet, baseSepolia] as const;

// Use one primary RPC per chain (Alchemy/Infura/QuickNode/etc.)
export const rpcUrls: Record<number, string> = {
  [mainnet.id]: process.env.NEXT_PUBLIC_MAINNET_RPC_URL!,
  [baseSepolia.id]: process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL!,
};
