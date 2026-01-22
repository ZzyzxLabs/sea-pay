export interface ChainConfig {
  key: string;
  name: string;
  chainId: number;
  rpcUrl: string;
  usdcAddress: `0x${string}`;
  explorer: string;
}

export const CHAIN_CONFIGS: ChainConfig[] = [
  {
    key: "base",
    name: "Base",
    chainId: 8453,
    rpcUrl: "https://mainnet.base.org",
    usdcAddress: "0x833589fCD6EDb6E08f4c7C32D4f71b54bdA02913",
    explorer: "https://basescan.org",
  },
  {
    key: "optimism",
    name: "Optimism",
    chainId: 10,
    rpcUrl: "https://mainnet.optimism.io",
    usdcAddress: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
    explorer: "https://optimistic.etherscan.io",
  },
];

export const DEFAULT_CHAIN_KEY = "base";

export function getChainConfig(key: string) {
  return CHAIN_CONFIGS.find((chain) => chain.key === key) ?? CHAIN_CONFIGS[0];
}
