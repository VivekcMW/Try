/**
 * POST /api/mobile/sos/escalate-batch — called every minute by Cloudflare Worker cron
 *
 * Finds all SOS incidents that:
 *  - are still open (no responders)
 *  - have escalationLevel = 0 (200 m wave was sent, 400 m not yet)
 *  - firstAlertAt is older than 2 minutes
 *
 * For each qualifying incident it calls the per-incident escalate route.
 * Secured by CRON_SECRET header. Idempotent.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const E2E         = process.env.E2E_TEST === "1" || (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");
const CRON_SECRET = process.env.CRON_SECRET ?? "";
const TWO_MIN_MS  = 2 * 60 * 1_000;

export async function POST(req: NextRequest) {
  const cronHeader = req.headers.get("x-cron-secret");
  if (!CRON_SECRET || cronHeader !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (E2E) return NextResponse.json({ processed: 0 });

  try {
    const cutoff = new Date(Date.now() - TWO_MIN_MS);

    // Find candidates: open, not yet escalated, first alert sent >2 min ago, has coordinates
    const candidates = await prisma.sosIncident.findMany({
      where: {
        status:         "open",
        escalationLevel: 0,
        firstAlertAt:   { not: null, lte: cutoff },
        lat:            { not: null },
        lng:            { not: null },
        responders:     { none: {} }, // no one responded yet
      },
      select: { id: true },
    });

    if (!candidates.length) {
      return NextResponse.json({ processed: 0 });
    }

    // Call the per-incident escalate endpoint for each candidate
    const appUrl = process.env.NEXTAUTH_URL ?? process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3399";

    const results = await Promise.allSettled(
      candidates.map((c) =>
        fetch(`${appUrl}/api/mobile/sos/${c.id}/escalate`, {
          method:  "POST",
          headers: { "x-cron-secret": CRON_SECRET, "Content-Type": "application/json" },
        }),
      ),
    );

    const escalated = results.filter((r) => r.status === "fulfilled").length;
    console.info(`[sos escalate-batch] processed=${candidates.length}, escalated=${escalated}`);

    return NextResponse.json({ processed: candidates.length, escalated });
  } catch (e) {
    console.error("[sos escalate-batch]", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
