import { readStorage, writeStorage } from "@/lib/storage";

export type ActivitySource = "earn" | "card" | "invest" | "onchain";

export interface ActivityItem {
  id: string;
  source: ActivitySource;
  title: string;
  amount: number;
  timestamp: number;
}

const STORAGE_KEY = "activity-feed";

const DEFAULT_ACTIVITY: ActivityItem[] = [
  {
    id: "seed-1",
    source: "card",
    title: "Bubble tea with friends",
    amount: -6.4,
    timestamp: Date.now() - 1000 * 60 * 60 * 26,
  },
  {
    id: "seed-2",
    source: "earn",
    title: "Savings earned",
    amount: 0.84,
    timestamp: Date.now() - 1000 * 60 * 60 * 18,
  },
  {
    id: "seed-3",
    source: "invest",
    title: "Bought tokenized AAPL",
    amount: -42.2,
    timestamp: Date.now() - 1000 * 60 * 60 * 8,
  },
];

export function getActivityFeed(): ActivityItem[] {
  return readStorage(STORAGE_KEY, DEFAULT_ACTIVITY).sort(
    (a, b) => b.timestamp - a.timestamp
  );
}

export function addActivityItem(input: Omit<ActivityItem, "id" | "timestamp">) {
  const existing = getActivityFeed();
  const next: ActivityItem = {
    id: `local-${Date.now()}`,
    timestamp: Date.now(),
    ...input,
  };
  const nextFeed = [next, ...existing].slice(0, 40);
  writeStorage(STORAGE_KEY, nextFeed);
  return nextFeed;
}

export function mergeActivityFeed(items: ActivityItem[]) {
  const existing = getActivityFeed();
  const combined = [...items, ...existing].reduce<ActivityItem[]>((acc, item) => {
    if (acc.find((entry) => entry.id === item.id)) return acc;
    acc.push(item);
    return acc;
  }, []);
  const sorted = combined.sort((a, b) => b.timestamp - a.timestamp).slice(0, 50);
  writeStorage(STORAGE_KEY, sorted);
  return sorted;
}
