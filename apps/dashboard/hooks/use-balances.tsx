"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { readCache, writeCache } from "@/lib/cache";
import { getNativeBalance, getUsdcBalance } from "@/services/evm/balances";
import { getChainConfig } from "@/services/evm/chains";

interface BalanceState {
  native: number;
  usdc: number;
  lastUpdated: number | null;
  status: "ok" | "degraded";
  loading: boolean;
}

const DEFAULT_STATE: BalanceState = {
  native: 0,
  usdc: 0,
  lastUpdated: null,
  status: "ok",
  loading: true,
};

export function useBalances(address: string | null, chainKey: string) {
  const [state, setState] = useState<BalanceState>(DEFAULT_STATE);
  const chain = useMemo(() => getChainConfig(chainKey), [chainKey]);
  const cacheKey = `balances-${chain.key}-${address ?? "anon"}`;

  const fetchBalances = useCallback(async () => {
    if (!address) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    try {
      const [native, usdc] = await Promise.all([
        getNativeBalance(chain, address as `0x${string}`),
        getUsdcBalance(chain, address as `0x${string}`),
      ]);
      const entry = writeCache(
        cacheKey,
        { native, usdc },
        1000 * 30
      );
      setState({
        native,
        usdc,
        lastUpdated: entry?.updatedAt ?? Date.now(),
        status: "ok",
        loading: false,
      });
    } catch {
      const cached = readCache<{ native: number; usdc: number }>(cacheKey);
      setState((prev) => ({
        native: cached?.value.native ?? prev.native,
        usdc: cached?.value.usdc ?? prev.usdc,
        lastUpdated: cached?.updatedAt ?? prev.lastUpdated,
        status: "degraded",
        loading: false,
      }));
    }
  }, [address, cacheKey, chain]);

  useEffect(() => {
    const cached = readCache<{ native: number; usdc: number }>(cacheKey);
    if (cached) {
      setState((prev) => ({
        ...prev,
        native: cached.value.native,
        usdc: cached.value.usdc,
        lastUpdated: cached.updatedAt,
        loading: false,
      }));
    }
    fetchBalances();
    const interval = setInterval(fetchBalances, 1000 * 20);
    return () => clearInterval(interval);
  }, [cacheKey, fetchBalances]);

  return { ...state, chain, refresh: fetchBalances };
}
