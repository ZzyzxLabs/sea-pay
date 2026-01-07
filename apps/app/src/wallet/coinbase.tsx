"use client";

import { createCoinbaseWalletSDK } from "@coinbase/wallet-sdk";

const APP_NAME = "SeaPay";
const PREFERENCE = {
  keysUrl: "https://keys-dev.coinbase.com/connect",
  options: "all" as const,
};

let coinbaseWalletSDK: ReturnType<typeof createCoinbaseWalletSDK> | null = null;

export const getCoinbaseWalletSDK = () => {
  if (typeof window === "undefined") {
    return null;
  }

  if (!coinbaseWalletSDK) {
    coinbaseWalletSDK = createCoinbaseWalletSDK({
      appName: APP_NAME,
      preference: PREFERENCE,
    });
  }

  return coinbaseWalletSDK;
};