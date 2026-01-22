import { readStorage, writeStorage } from "@/lib/storage";
import { addActivityItem } from "@/services/mock/activity";

export interface CardState {
  step: number;
  limit: number;
  spent: number;
  transactions: Array<{
    id: string;
    merchant: string;
    category: string;
    amount: number;
    timestamp: number;
  }>;
}

const STORAGE_KEY = "card-state";

const DEFAULT_CARD_STATE: CardState = {
  step: 0,
  limit: 2200,
  spent: 382.4,
  transactions: [
    {
      id: "c-1",
      merchant: "Uni Cafe",
      category: "Food",
      amount: 7.8,
      timestamp: Date.now() - 1000 * 60 * 60 * 5,
    },
    {
      id: "c-2",
      merchant: "Metro Pass",
      category: "Transport",
      amount: 28,
      timestamp: Date.now() - 1000 * 60 * 60 * 28,
    },
  ],
};

export function getCardState(): CardState {
  return readStorage(STORAGE_KEY, DEFAULT_CARD_STATE);
}

export function advanceCardStep() {
  const state = getCardState();
  const nextStep = Math.min(state.step + 1, 3);
  const nextState = { ...state, step: nextStep };
  writeStorage(STORAGE_KEY, nextState);
  return nextState;
}

export function addCardSpend(amount: number, merchant: string, category: string) {
  const state = getCardState();
  const nextTxn = {
    id: `c-${Date.now()}`,
    merchant,
    category,
    amount,
    timestamp: Date.now(),
  };
  const nextState: CardState = {
    ...state,
    spent: state.spent + amount,
    transactions: [nextTxn, ...state.transactions].slice(0, 12),
  };
  writeStorage(STORAGE_KEY, nextState);
  addActivityItem({
    source: "card",
    title: `Card spend · ${merchant}`,
    amount: -amount,
  });
  return nextState;
}
