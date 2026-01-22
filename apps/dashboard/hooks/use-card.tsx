"use client";

import { useCallback, useState } from "react";
import {
  addCardSpend,
  advanceCardStep,
  getCardState,
  type CardState,
} from "@/services/mock/card";

export function useCard() {
  const [state, setState] = useState<CardState>(() => getCardState());

  const advance = useCallback(() => {
    setState(advanceCardStep());
  }, []);

  const spend = useCallback((amount: number, merchant: string, category: string) => {
    setState(addCardSpend(amount, merchant, category));
  }, []);

  return { state, advance, spend };
}
