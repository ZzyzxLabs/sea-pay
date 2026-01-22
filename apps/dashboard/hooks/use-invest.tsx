"use client";

import { useCallback, useState } from "react";
import { buyAsset, getInvestState, sellAsset, type InvestState } from "@/services/mock/invest";

export function useInvest() {
  const [state, setState] = useState<InvestState>(() => getInvestState());

  const buy = useCallback((symbol: string, quantity: number) => {
    setState(buyAsset(symbol, quantity));
  }, []);

  const sell = useCallback((symbol: string, quantity: number) => {
    setState(sellAsset(symbol, quantity));
  }, []);

  return { state, buy, sell };
}
