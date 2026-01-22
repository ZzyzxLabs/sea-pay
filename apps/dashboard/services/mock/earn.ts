import { readStorage, writeStorage } from "@/lib/storage";
import { addActivityItem } from "@/services/mock/activity";

export interface EarnState {
  balance: number;
  apy: number;
  earned: number;
  lastAccrualAt: number;
  points: number[];
}

const DEFAULT_EARN_STATE: EarnState = {
  balance: 420.25,
  apy: 4.6,
  earned: 12.44,
  lastAccrualAt: Date.now(),
  points: [402, 408, 415, 421, 427, 433, 440],
};

const STORAGE_KEY = "earn-state";

function accrue(state: EarnState): EarnState {
  const now = Date.now();
  const hours = (now - state.lastAccrualAt) / (1000 * 60 * 60);
  if (hours <= 0.1) return state;

  const hourlyRate = state.apy / 100 / 365 / 24;
  const accrued = state.balance * hourlyRate * hours;
  return {
    ...state,
    earned: state.earned + accrued,
    balance: state.balance + accrued,
    lastAccrualAt: now,
    points: [...state.points.slice(1), state.balance + accrued],
  };
}

export function getEarnState(): EarnState {
  const state = readStorage(STORAGE_KEY, DEFAULT_EARN_STATE);
  const nextState = accrue(state);
  if (nextState !== state) writeStorage(STORAGE_KEY, nextState);
  return nextState;
}

export function depositEarn(amount: number) {
  const state = getEarnState();
  const nextState = {
    ...state,
    balance: state.balance + amount,
    lastAccrualAt: Date.now(),
  };
  writeStorage(STORAGE_KEY, nextState);
  addActivityItem({
    source: "earn",
    title: "Savings deposit",
    amount,
  });
  return nextState;
}

export function withdrawEarn(amount: number) {
  const state = getEarnState();
  const nextState = {
    ...state,
    balance: Math.max(0, state.balance - amount),
    lastAccrualAt: Date.now(),
  };
  writeStorage(STORAGE_KEY, nextState);
  addActivityItem({
    source: "earn",
    title: "Savings withdrawal",
    amount: -amount,
  });
  return nextState;
}
