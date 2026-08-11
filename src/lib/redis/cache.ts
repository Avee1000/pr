import redis from "../redis/redis";

const TTL_SECONDS = {
  SHORT: 30,
  DEFAULT: 60,
  MEDIUM: 300,
  LONG: 3600,
} as const;

type CacheTtl = (typeof TTL_SECONDS)[keyof typeof TTL_SECONDS];

export const CacheKeys = {
  orders: (userId: string) => `orders:${userId}`,
  cashflow: (userId: string) => `cashflow:${userId}`,
  customers: (userId: string) => `customers:${userId}`,
  materials: (userId: string) => `materials:${userId}`,
  laborCost: (userId: string) => `laborCost:${userId}`,
  targetProfit: (userId: string) => `targetProfit:${userId}`,
  notifications: (userId: string) => `notifications:${userId}`,
  quote: (token: string) => `quote:${token}`,
  testimonials: (locale: string) => `testimonials:${locale}`,
};

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const value = await redis.get(key);
    if (value === null) return null;
    return JSON.parse(value) as T;
  } catch (error) {
    console.error(`[Redis] getCache error for key "${key}":`, error);
    return null;
  }
}

export async function setCache<T>(
  key: string,
  value: T,
  ttl: CacheTtl = TTL_SECONDS.DEFAULT
): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttl);
  } catch (error) {
    console.error(`[Redis] setCache error for key "${key}":`, error);
  }
}

export async function delCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (error) {
    console.error(`[Redis] delCache error for key "${key}":`, error);
  }
}

/**
 * Deletes keys matching a wildcard pattern using SCAN (non-blocking).
 * Example usage: delPattern("orders:user_123:*")
 */
export async function delPattern(pattern: string): Promise<void> {
  try {
    let cursor = "0";
    do {
      // SCAN iterates over keys in non-blocking batches
      const [nextCursor, keys] = await redis.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        100
      );
      cursor = nextCursor;

      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== "0");
  } catch (error) {
    console.error(`[Redis] delPattern error for pattern "${pattern}":`, error);
  }
}

export { TTL_SECONDS };