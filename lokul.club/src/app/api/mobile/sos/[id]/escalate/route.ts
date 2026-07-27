/**
 * POST /api/mobile/sos/[id]/escalate — internal route called by cron
 *
 * Fires the 400 m push wave for an incident that had no responders after 2 min.
 * Secured by CRON_SECRET header.  Idempotent — safe to call multiple times.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { findNearbyTokens, sendPush } from "@/lib/push";

const E2E         = process.env.E2E_TEST === "1" || (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");
const CRON_SECRET = process.env.CRON_SECRET ?? "";
const TWO_MIN_MS  = 2 * 60 * 1_000;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Auth: only Cloudflare cron worker (or internal callers) may call this
  const cronHeader = req.headers.get("x-cron-secret");
  if (!CRON_SECRET || cronHeader !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (E2E) return NextResponse.json({ ok: true, escalated: false, reason: "e2e" });

  try {
    const incident = await prisma.sosIncident.findUnique({
      where:   { id },
      include: { responders: true, author: { select: { name: true } } },
    });

    if (!incident) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Already escalated or resolved
    if (incident.escalationLevel >= 1 || incident.status === "resolved") {
      return NextResponse.json({ ok: true, escalated: false, reason: "already_handled" });
    }

    // Not yet 2 minutes since first alert
    const elapsed = incident.firstAlertAt
      ? Date.now() - incident.firstAlertAt.getTime()
      : Infinity;
    if (elapsed < TWO_MIN_MS) {
      return NextResponse.json({ ok: true, escalated: false, reason: "too_soon" });
    }

    // Has responders — no need to escalate
    if (incident.responders.length > 0) {
      return NextResponse.json({ ok: true, escalated: false, reason: "has_responders" });
    }

    // No coordinates — cannot do geo escalation
    if (incident.lat === null || incident.lng === null) {
      return NextResponse.json({ ok: true, escalated: false, reason: "no_coords" });
    }

    // Find devices in 400 m, excluding already-notified users
    const nearby = await findNearbyTokens(
      incident.lat,
      incident.lng,
      400,
      incident.notifiedUserIds,
    );

    if (nearby.tokens.length) {
      const categoryLabel = incident.category
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

      await sendPush(
        { tokens: nearby.tokens },
        {
          title:    `🚨 URGENT: ${categoryLabel} — 400 m away, no response yet`,
          body:     `${incident.author.name}: ${incident.body.slice(0, 80)} — Please help!`,
          data:     { type: "sos", incidentId: incident.id, pinCode: incident.pinCode, radiusM: 400 },
          priority: "high",
        },
      );
    }

    // Mark escalated regardless (even if no new tokens — prevents retry spam)
    await prisma.sosIncident.update({
      where: { id },
      data: {
        escalationLevel:  1,
        escalatedAt:      new Date(),
        notifiedUserIds:  [
          ...incident.notifiedUserIds,
          ...nearby.userIds,
        ],
      },
    });

    return NextResponse.json({ ok: true, escalated: true, newRecipients: nearby.tokens.length });
  } catch (e) {
    console.error("[sos escalate]", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
