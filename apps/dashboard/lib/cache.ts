interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  updatedAt: number;
}

const cachePrefix = "seapay-cache";

export function readCache<T>(key: string): CacheEntry<T> | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(`${cachePrefix}:${key}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CacheEntry<T>;
  } catch {
    return null;
  }
}

export function writeCache<T>(key: string, value: T, ttlMs: number) {
  if (typeof window === "undefined") return;
  const entry: CacheEntry<T> = {
    value,
    updatedAt: Date.now(),
    expiresAt: Date.now() + ttlMs,
  };
  window.localStorage.setItem(`${cachePrefix}:${key}`, JSON.stringify(entry));
  return entry;
}
