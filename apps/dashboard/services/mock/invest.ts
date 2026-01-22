import { readStorage, writeStorage } from "@/lib/storage";
import { addActivityItem } from "@/services/mock/activity";

export interface StockAsset {
  symbol: string;
  name: string;
  price: number;
  change: number;
}

export interface Position {
  symbol: string;
  quantity: number;
  averageCost: number;
}

export interface InvestState {
  assets: StockAsset[];
  positions: Position[];
}

const STORAGE_KEY = "invest-state";

const DEFAULT_ASSETS: StockAsset[] = [
  { symbol: "AAPL", name: "Apple", price: 189.2, change: 1.6 },
  { symbol: "TSLA", name: "Tesla", price: 248.4, change: -2.1 },
  { symbol: "NVDA", name: "NVIDIA", price: 498.7, change: 3.4 },
  { symbol: "AMZN", name: "Amazon", price: 172.3, change: 1.1 },
  { symbol: "META", name: "Meta", price: 336.8, change: -0.6 },
];

const DEFAULT_STATE: InvestState = {
  assets: DEFAULT_ASSETS,
  positions: [
    { symbol: "AAPL", quantity: 0.22, averageCost: 182.5 },
    { symbol: "NVDA", quantity: 0.05, averageCost: 472.1 },
  ],
};

export function getInvestState(): InvestState {
  return readStorage(STORAGE_KEY, DEFAULT_STATE);
}

function updatePosition(
  positions: Position[],
  symbol: string,
  quantity: number,
  price: number
) {
  const existing = positions.find((position) => position.symbol === symbol);
  if (!existing) {
    return [...positions, { symbol, quantity, averageCost: price }];
  }
  const nextQty = existing.quantity + quantity;
  if (nextQty <= 0) {
    return positions.filter((position) => position.symbol !== symbol);
  }
  const nextCost =
    (existing.averageCost * existing.quantity + price * quantity) / nextQty;
  return positions.map((position) =>
    position.symbol === symbol
      ? { ...position, quantity: nextQty, averageCost: nextCost }
      : position
  );
}

export function buyAsset(symbol: string, quantity: number) {
  const state = getInvestState();
  const asset = state.assets.find((item) => item.symbol === symbol);
  if (!asset) return state;
  const nextState: InvestState = {
    ...state,
    positions: updatePosition(state.positions, symbol, quantity, asset.price),
  };
  writeStorage(STORAGE_KEY, nextState);
  addActivityItem({
    source: "invest",
    title: `Bought ${symbol}`,
    amount: -(asset.price * quantity),
  });
  return nextState;
}

export function sellAsset(symbol: string, quantity: number) {
  const state = getInvestState();
  const asset = state.assets.find((item) => item.symbol === symbol);
  if (!asset) return state;
  const nextState: InvestState = {
    ...state,
    positions: updatePosition(state.positions, symbol, -quantity, asset.price),
  };
  writeStorage(STORAGE_KEY, nextState);
  addActivityItem({
    source: "invest",
    title: `Sold ${symbol}`,
    amount: asset.price * quantity,
  });
  return nextState;
}
