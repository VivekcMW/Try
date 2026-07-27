/**
 * GET /api/health — liveness + dependency health for uptime monitoring.
 *
 * Returns 200 when the app and Postgres are healthy, 503 otherwise.
 * Redis is reported but NOT gated on (rate limiter degrades gracefully).
 *
 * Wire this into: Vercel checks, BetterStack/UptimeRobot, and the on-call
 * alert policy (see docs/runbooks/on-call-alerts.md).
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Redis from "ioredis";

export const dynamic = "force-dynamic";

const E2E =
  process.env.E2E_TEST === "1" ||
  (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");

async function pingDb(): Promise<{ ok: boolean; latencyMs: number }> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true, latencyMs: Date.now() - start };
  } catch {
    return { ok: false, latencyMs: Date.now() - start };
  }
}

async function pingRedis(): Promise<{ ok: boolean; latencyMs: number } | null> {
  const url = process.env.REDIS_URL;
  if (!url) return null; // not configured — omit from report
  const start = Date.now();
  const client = new Redis(url, {
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    connectTimeout: 2000,
  });
  try {
    await client.connect();
    await client.ping();
    return { ok: true, latencyMs: Date.now() - start };
  } catch {
    return { ok: false, latencyMs: Date.now() - start };
  } finally {
    client.disconnect();
  }
}

export async function GET() {
  if (E2E) {
    return NextResponse.json({ status: "ok", isStub: true });
  }

  const [db, redis] = await Promise.all([pingDb(), pingRedis()]);

  const healthy = db.ok; // DB is the only hard dependency
  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      checks: {
        db,
        ...(redis ? { redis } : {}),
      },
    },
    { status: healthy ? 200 : 503 }
  );
}
