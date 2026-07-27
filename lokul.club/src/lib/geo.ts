/**
 * Geo detection helpers for Lokul.
 *
 * Priority order:
 *  1. Cloudflare Worker custom headers (X-Geo-*) — injected by cloudflare-worker.js
 *  2. CloudFront headers (cloudfront-viewer-*)
 *  3. ipapi.co fallback using client IP (free tier, no key required)
 */

export interface GeoResult {
  /** 6-digit Indian PIN code, or null if not detected / non-Indian IP */
  pin:    string | null;
  /** City name e.g. "Bengaluru" */
  city:   string | null;
  /** State / region e.g. "Karnataka" */
  region: string | null;
}

const EMPTY: GeoResult = { pin: null, city: null, region: null };

/**
 * Read geo from request headers.
 * Works with Cloudflare Worker (X-Geo-*) or CloudFront (cloudfront-viewer-*).
 */
export function parseGeoHeaders(headers: Headers): GeoResult {
  // 1. Cloudflare Worker custom headers (set by cloudflare-worker.js)
  const country = (
    headers.get("x-geo-country") ??
    headers.get("cf-ipcountry") ??
    ""
  ).toUpperCase();
  const postal = headers.get("x-geo-postal") ?? "";
  const city   = headers.get("x-geo-city")   ?? null;
  const region = headers.get("x-geo-region") ?? null;

  if (country === "IN" && /^\d{6}$/.test(postal)) {
    return { pin: postal, city, region };
  }

  // 2. CloudFront headers (AWS)
  const cfCountry = (headers.get("cloudfront-viewer-country") ?? "").toUpperCase();
  const cfPostal  = headers.get("cloudfront-viewer-postal-code") ?? "";
  const cfCity    = headers.get("cloudfront-viewer-city") ?? null;
  if (cfCountry === "IN" && /^\d{6}$/.test(cfPostal)) {
    return { pin: cfPostal, city: cfCity, region: null };
  }

  return EMPTY;
}

/** Extract real client IP, preferring Cloudflare's header over generic forwarded-for. */
export function getClientIp(headers: Headers): string | null {
  return (
    headers.get("cf-connecting-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    null
  );
}

// In-memory cache for IP lookups (module-level, reused across requests in same process)
const ipCache = new Map<string, { result: GeoResult; ts: number }>();
const IP_CACHE_TTL = 24 * 60 * 60 * 1_000; // 24 h

/**
 * Look up geo for an IP via ipapi.co (free, no API key, 1k req/day).
 * Results are cached in-process for 24 hours to stay well within the limit.
 */
export async function lookupIpGeo(ip: string): Promise<GeoResult> {
  const cached = ipCache.get(ip);
  if (cached && Date.now() - cached.ts < IP_CACHE_TTL) return cached.result;

  try {
    const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, {
      headers: { "User-Agent": "lokul.club/1.0 (geo-detect; contact@lokul.club)" },
      signal:  AbortSignal.timeout(3_000),
    });
    if (!res.ok) return EMPTY;

    const data = await res.json() as Record<string, unknown>;
    const countryCode = typeof data.country_code === "string" ? data.country_code : "";
    const postal      = typeof data.postal       === "string" ? data.postal       : "";
    const cityName    = typeof data.city         === "string" ? data.city         : null;
    const regionName  = typeof data.region       === "string" ? data.region       : null;

    const result: GeoResult = {
      pin:    countryCode === "IN" && /^\d{6}$/.test(postal) ? postal : null,
      city:   cityName,
      region: regionName,
    };

    ipCache.set(ip, { result, ts: Date.now() });
    // Keep cache bounded
    if (ipCache.size > 2_000) {
      const first = ipCache.keys().next().value;
      if (first) ipCache.delete(first);
    }
    return result;
  } catch {
    return EMPTY;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PROXIMITY HELPERS — used by SOS escalation
// ─────────────────────────────────────────────────────────────────────────────

const EARTH_RADIUS_M = 6_371_000;
const LAT_DEG_PER_M  = 1 / 111_320;

function lonDegPerM(lat: number): number {
  return 1 / (111_320 * Math.cos((lat * Math.PI) / 180));
}

/** Axis-aligned bounding box for a centre point + radius in metres */
export function boundingBox(lat: number, lon: number, radiusM: number) {
  const dlat = radiusM * LAT_DEG_PER_M;
  const dlon = radiusM * lonDegPerM(lat);
  return {
    minLat: lat - dlat,
    maxLat: lat + dlat,
    minLon: lon - dlon,
    maxLon: lon + dlon,
  };
}

/** Haversine great-circle distance in metres between two WGS-84 points */
export function haversineM(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_M * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
