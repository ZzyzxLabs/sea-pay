"use client";

import { useMemo } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";

export function usePrivyAddress() {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();

  const address = useMemo(() => {
    if (!authenticated) return null;
    const wallet = wallets.find((item) => item.address);
    return wallet?.address ?? null;
  }, [authenticated, wallets]);

  return address;
}
