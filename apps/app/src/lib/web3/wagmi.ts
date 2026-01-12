import { createConfig, http , type Transport } from "wagmi";
import { chains } from "./chains";
import { metaMask, coinbaseWallet, injected } from "wagmi/connectors";

// const MAINNET_RPC = process.env.NEXT_PUBLIC_MAINNET_RPC_URL!;
// const SEPOLIA_RPC = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL!;
// const BASE_RPC = process.env.NEXT_PUBLIC_BASE_RPC_URL!;

type ChainId = (typeof chains)[number]["id"];
const transports: Record<ChainId, Transport> = Object.fromEntries(
    chains.map((c) => [c.id, http()])
  ) as Record<ChainId, Transport>

export const config = createConfig({
  ssr: true,
  chains: chains,
  connectors: [
    // MetaMask SDK connector
    metaMask({
      // Optional: only needed if you want the MetaMask SDK itself to do read-only RPC via Infura.
      // If you already supply your own RPCs in `transports`, you can omit this.
      infuraAPIKey: process.env.NEXT_PUBLIC_INFURA_API_KEY,
    }),

    // Coinbase Wallet connector
    coinbaseWallet({
      appName: "SeaPay",
      appLogoUrl: "https://seapay.ai/logo.png",
    }),

    // injected(),

  ],
  transports: transports,
});
