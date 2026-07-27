/**
 * Locality news service for the mobile app.
 *
 * Polls /api/news/locality, caches results in AsyncStorage for 15 minutes,
 * and returns typed LocalityNewsItem objects for use in the feed.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = 'lokul.news.cache.v1';
const TTL_MS = 15 * 60 * 1000; // 15 minutes

/** Mirror of the DB enum LocalityNewsCategory */
export type NewsCategory =
  | 'civic'
  | 'safety'
  | 'weather'
  | 'health'
  | 'transport'
  | 'local';

export interface LocalityNewsItem {
  id: string;
  headline: string;
  summary: string;
  sourceUrl: string;
  sourceName: string;
  category: NewsCategory;
  lang: string;
  isAlert: boolean;
  publishedAt: string; // ISO string
  pinCode: string;
  city: string;
}

interface CacheEntry {
  items: LocalityNewsItem[];
  fetchedAt: number;
}

type CacheMap = Record<string, CacheEntry>;

// ─── Cache helpers ────────────────────────────────────────────────────────────

async function readCache(): Promise<CacheMap> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as CacheMap;
  } catch {
    return {};
  }
}

async function writeCache(cache: CacheMap): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // non-fatal
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface FetchNewsOptions {
  pinCode: string;
  city?: string;
  lang?: string;
  limit?: number;
  /** Skip cache and force a fresh fetch */
  forceRefresh?: boolean;
}

export async function fetchLocalityNews(
  opts: FetchNewsOptions,
): Promise<LocalityNewsItem[]> {
  const { pinCode, city, lang = 'en', limit = 20, forceRefresh = false } = opts;
  const cacheKey = `${pinCode}:${lang}`;

  if (!forceRefresh) {
    const cache = await readCache();
    const entry = cache[cacheKey];
    if (entry && Date.now() - entry.fetchedAt < TTL_MS) {
      return entry.items;
    }
  }

  const apiBase =
    process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4200';

  const url = new URL(`${apiBase}/api/news/locality`);
  url.searchParams.set('pinCode', pinCode);
  url.searchParams.set('lang', lang);
  url.searchParams.set('limit', String(limit));
  if (city) url.searchParams.set('city', city);

  try {
    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      return getCached(cacheKey);
    }

    const data = (await res.json()) as { items: LocalityNewsItem[] };
    const items = data.items ?? [];

    const cache = await readCache();
    cache[cacheKey] = { items, fetchedAt: Date.now() };
    await writeCache(cache);

    return items;
  } catch {
    // Network error — return stale cache if available
    return getCached(cacheKey);
  }
}

async function getCached(key: string): Promise<LocalityNewsItem[]> {
  const cache = await readCache();
  return cache[key]?.items ?? [];
}

/** Clear the news cache (call on logout or locality change) */
export async function clearNewsCache(): Promise<void> {
  await AsyncStorage.removeItem(CACHE_KEY);
}
