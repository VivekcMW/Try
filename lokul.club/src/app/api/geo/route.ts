import { type NextRequest, NextResponse } from "next/server";
import { parseGeoHeaders, getClientIp, lookupIpGeo } from "@/lib/geo";

export const runtime = "nodejs";

/**
 * GET /api/geo
 * Returns { pin, city, region } for the requesting user.
 *
 * On production (Cloudflare in front): uses X-Geo-* headers, zero latency.
 * On dev / direct origin: falls back to ipapi.co IP lookup.
 */
export async function GET(req: NextRequest) {
  // 1. Try CDN/proxy headers first (Cloudflare Worker or CloudFront)
  let geo = parseGeoHeaders(req.headers);

  // 2. Fallback to IP-based lookup
  if (!geo.pin) {
    const ip = getClientIp(req.headers);
    const isLocal =
      !ip ||
      ip === "127.0.0.1" ||
      ip === "::1" ||
      ip === "::ffff:127.0.0.1" ||
      ip.startsWith("192.168.") ||
      ip.startsWith("10.");
    if (!isLocal) {
      geo = await lookupIpGeo(ip!);
    }
  }

  return NextResponse.json(geo, {
    headers: { "Cache-Control": "private, max-age=3600" },
  });
}
