import { type NextRequest, NextResponse } from "next/server";

interface ReverseResult {
  pin:  string | null;
  city: string | null;
}

// In-memory cache keyed by "lat,lng" rounded to 4 decimal places
const cache = new Map<string, ReverseResult & { ts: number }>();
const TTL   = 7 * 24 * 60 * 60 * 1_000; // 7 days — postal codes don't change

/**
 * POST /api/reverse-geocode
 * Body: { lat: number, lng: number }
 * Returns: { pin: string | null, city: string | null }
 *
 * Calls Nominatim (OpenStreetMap) with a proper User-Agent as required by
 * their usage policy. Results are cached for 7 days per unique coordinate.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const { lat, lng } = (body ?? {}) as Record<string, unknown>;
  if (
    typeof lat !== "number" || typeof lng !== "number" ||
    lat < -90 || lat > 90 || lng < -180 || lng > 180
  ) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }

  const key    = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < TTL) {
    return NextResponse.json({ pin: cached.pin, city: cached.city });
  }

  try {
    const url = [
      "https://nominatim.openstreetmap.org/reverse",
      `?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=en`,
    ].join("");

    const res = await fetch(url, {
      headers: {
        "User-Agent": "lokul.club/1.0 (reverse-geocode; contact@lokul.club)",
      },
      signal: AbortSignal.timeout(5_000),
    });
    if (!res.ok) throw new Error(`Nominatim ${res.status}`);

    const data = await res.json() as { address?: Record<string, string> };
    const postal = (data.address?.postcode ?? "").replace(/\s/g, "");
    const pin    = /^\d{6}$/.test(postal) ? postal : null;
    const city   =
      data.address?.city ??
      data.address?.town ??
      data.address?.county ??
      null;

    const result: ReverseResult = { pin, city };
    cache.set(key, { ...result, ts: Date.now() });

    // Keep cache bounded at 500 entries
    if (cache.size > 500) {
      const first = cache.keys().next().value;
      if (first) cache.delete(first);
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ pin: null, city: null }, { status: 502 });
  }
}
