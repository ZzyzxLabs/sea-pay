"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getRecentUsdcTransfers } from "@/services/evm/transfers";
import { getChainConfig } from "@/services/evm/chains";
import { ActivityItem, getActivityFeed, mergeActivityFeed } from "@/services/mock/activity";

interface ActivityState {
  items: ActivityItem[];
  lastUpdated: number | null;
  status: "ok" | "degraded";
  loading: boolean;
}

const DEFAULT_STATE: ActivityState = {
  items: [],
  lastUpdated: null,
  status: "ok",
  loading: true,
};

export function useActivity(address: string | null, chainKey: string) {
  const [state, setState] = useState<ActivityState>(DEFAULT_STATE);
  const chain = useMemo(() => getChainConfig(chainKey), [chainKey]);

  const fetchActivity = useCallback(async () => {
    const local = getActivityFeed();
    if (!address) {
      setState({
        items: local,
        lastUpdated: Date.now(),
        status: "ok",
        loading: false,
      });
      return;
    }

    try {
      const transfers = await getRecentUsdcTransfers(
        chain,
        address as `0x${string}`,
        7200
      );
      const onchainItems: ActivityItem[] = transfers.map((event) => ({
        id: event.id,
        source: "onchain",
        title: event.direction === "out" ? "USDC sent" : "USDC received",
        amount: event.direction === "out" ? -event.amount : event.amount,
        timestamp: event.timestamp,
      }));
      const merged = mergeActivityFeed(onchainItems);
      setState({
        items: merged,
        lastUpdated: Date.now(),
        status: "ok",
        loading: false,
      });
    } catch {
      setState({
        items: local,
        lastUpdated: Date.now(),
        status: "degraded",
        loading: false,
      });
    }
  }, [address, chain]);

  useEffect(() => {
    fetchActivity();
    const interval = setInterval(fetchActivity, 1000 * 45);
    return () => clearInterval(interval);
  }, [fetchActivity]);

  return { ...state, chain, refresh: fetchActivity };
}
