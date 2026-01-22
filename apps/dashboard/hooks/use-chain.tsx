"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_CHAIN_KEY } from "@/services/evm/chains";

const STORAGE_KEY = "chain-key";

export function useChain() {
  const [chainKey, setChainKey] = useState(DEFAULT_CHAIN_KEY);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) setChainKey(stored);
  }, []);

  const updateChain = useCallback((nextKey: string) => {
    setChainKey(nextKey);
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, nextKey);
  }, []);

  return { chainKey, updateChain };
}
