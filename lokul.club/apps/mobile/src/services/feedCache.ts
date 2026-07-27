/**
 * Offline feed cache — stores the last fetched feed posts to AsyncStorage
 * so the app renders something on 2G/no-connectivity.
 *
 * TTL: 4 hours (stale-while-revalidate pattern).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'lokul.cache.v1.';
const DEFAULT_TTL_MS = 4 * 60 * 60 * 1_000; // 4 hours

interface CacheEntry<T> {
  data: T;
  cachedAt: number;
  ttl: number;
}

export const feedCache = {
  async set<T>(key: string, data: T, ttlMs = DEFAULT_TTL_MS): Promise<void> {
    const entry: CacheEntry<T> = { data, cachedAt: Date.now(), ttl: ttlMs };
    try {
      await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
    } catch {
      // Storage full — silently ignore
    }
  },

  async get<T>(key: string): Promise<{ data: T; stale: boolean } | null> {
    try {
      const raw = await AsyncStorage.getItem(CACHE_PREFIX + key);
      if (!raw) return null;
      const entry = JSON.parse(raw) as CacheEntry<T>;
      const age = Date.now() - entry.cachedAt;
      return { data: entry.data, stale: age > entry.ttl };
    } catch {
      return null;
    }
  },

  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(CACHE_PREFIX + key);
  },

  /** Purge all cache entries older than their TTL. */
  async purgeExpired(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter((k) => k.startsWith(CACHE_PREFIX));
      for (const k of cacheKeys) {
        const raw = await AsyncStorage.getItem(k);
        if (!raw) continue;
        const entry = JSON.parse(raw) as CacheEntry<unknown>;
        if (Date.now() - entry.cachedAt > entry.ttl * 2) {
          await AsyncStorage.removeItem(k);
        }
      }
    } catch {
      // Non-critical
    }
  },
};
