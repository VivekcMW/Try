import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = 'lokul.translation.cache.v1';
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

type CacheEntry = {
  value: string;
  expiresAt: number;
};

type CacheMap = Record<string, CacheEntry>;

export type TranslateRequest = {
  text: string;
  sourceLang: string;
  targetLang: string;
};

const keyFor = ({ text, sourceLang, targetLang }: TranslateRequest) =>
  `${sourceLang}:${targetLang}:${text.trim().toLowerCase()}`;

async function readCache(): Promise<CacheMap> {
  const raw = await AsyncStorage.getItem(CACHE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as CacheMap;
  } catch {
    return {};
  }
}

async function writeCache(cache: CacheMap) {
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

export async function translateUGC({ text, sourceLang, targetLang }: TranslateRequest): Promise<string> {
  const cleanText = text.trim();
  if (!cleanText) return '';
  if (sourceLang === targetLang) return cleanText;

  const request: TranslateRequest = { text: cleanText, sourceLang, targetLang };
  const cacheKey = keyFor(request);

  const cache = await readCache();
  const existing = cache[cacheKey];
  if (existing && existing.expiresAt > Date.now()) {
    return existing.value;
  }

  const endpoint = process.env.EXPO_PUBLIC_INDIC_TRANSLATE_API_URL;
  const apiKey = process.env.EXPO_PUBLIC_INDIC_TRANSLATE_API_KEY;

  if (!endpoint) {
    return cleanText;
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        q: cleanText,
        source: sourceLang,
        target: targetLang,
      }),
    });

    if (!response.ok) {
      return cleanText;
    }

    const payload = (await response.json()) as { translatedText?: string; translation?: string };
    const translated = payload.translatedText ?? payload.translation ?? cleanText;

    cache[cacheKey] = {
      value: translated,
      expiresAt: Date.now() + TTL_MS,
    };
    await writeCache(cache);

    return translated;
  } catch {
    return cleanText;
  }
}

export async function clearUGCTranslationCache() {
  await AsyncStorage.removeItem(CACHE_KEY);
}
