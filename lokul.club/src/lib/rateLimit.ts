/**
 * Sliding-window rate limiter backed by Redis (ioredis).
 * Falls back gracefully (returns ok=true) when REDIS_URL is not configured
 * or in E2E test mode so tests are never blocked by rate-limit logic.
 */
import Redis from "ioredis";

const E2E =
  process.env.E2E_TEST === "1" ||
  (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (E2E) return null;
  const url = process.env.REDIS_URL;
  if (!url) return null;
  if (!redis) {
    redis = new Redis(url, {
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
    });
    redis.on("error", () => {
      // suppress connection errors — rate-limiter degrades gracefully
    });
  }
  return redis;
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetInMs: number;
}

/**
 * Sliding-window counter using Redis INCR + EXPIRE.
 *
 * @param key        Unique key, e.g. `rl:otp:192.168.1.1`
 * @param limit      Maximum requests allowed in the window
 * @param windowSec  Window duration in seconds
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSec: number
): Promise<RateLimitResult> {
  const r = getRedis();
  if (!r) {
    // No Redis — allow all requests
    return { ok: true, remaining: limit, resetInMs: windowSec * 1000 };
  }

  try {
    const pipeline = r.pipeline();
    pipeline.incr(key);
    pipeline.pttl(key);
    const [[incrErr, count], [ttlErr, pttl]] = (await pipeline.exec()) as [
      [Error | null, number],
      [Error | null, number]
    ];

    if (incrErr || ttlErr) return { ok: true, remaining: limit, resetInMs: windowSec * 1000 };

    // Set expiry only on the first increment
    if (count === 1) {
      await r.expire(key, windowSec);
    }

    const resetInMs = pttl > 0 ? pttl : windowSec * 1000;
    const remaining = Math.max(0, limit - count);
    return { ok: count <= limit, remaining, resetInMs };
  } catch {
    // Redis error — fail open
    return { ok: true, remaining: limit, resetInMs: windowSec * 1000 };
  }
}

/**
 * Returns a rate-limit response (429) if the key is over limit.
 * Returns null if the request is allowed so callers can short-circuit.
 */
export async function guardRateLimit(
  key: string,
  limit: number,
  windowSec: number
): Promise<Response | null> {
  const result = await checkRateLimit(key, limit, windowSec);
  if (result.ok) return null;

  const { NextResponse } = await import("next/server");
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.ceil(result.resetInMs / 1000)),
        "X-RateLimit-Limit": String(limit),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(Math.ceil(result.resetInMs / 1000)),
      },
    }
  );
}
