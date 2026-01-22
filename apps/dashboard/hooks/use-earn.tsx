"use client";

import { useCallback, useEffect, useState } from "react";
import {
  depositEarn,
  getEarnState,
  withdrawEarn,
  type EarnState,
} from "@/services/mock/earn";

export function useEarn() {
  const [state, setState] = useState<EarnState>(() => getEarnState());

  const refresh = useCallback(() => {
    setState(getEarnState());
  }, []);

  const deposit = useCallback((amount: number) => {
    setState(depositEarn(amount));
  }, []);

  const withdraw = useCallback((amount: number) => {
    setState(withdrawEarn(amount));
  }, []);

  useEffect(() => {
    const interval = setInterval(refresh, 1000 * 60);
    return () => clearInterval(interval);
  }, [refresh]);

  return { state, deposit, withdraw, refresh };
}
