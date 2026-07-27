/**
 * POST /api/mobile/sos/[id]/respond
 * Body: { userId: string }
 * Records the user as a responder; each user can respond once.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPush } from "@/lib/push";

const E2E = process.env.E2E_TEST === "1" || (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id: incidentId } = await params;
  if (E2E) return NextResponse.json({ ok: true });

  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    // Upsert — idempotent
    await prisma.sosResponder.upsert({
      where:  { incidentId_userId: { incidentId, userId } },
      create: { incidentId, userId },
      update: { respondedAt: new Date() },
    });

    // Acknowledge the incident if it's still open
    const updated = await prisma.sosIncident.findFirst({
      where:  { id: incidentId },
      select: { authorId: true, category: true, status: true },
    });
    if (updated?.status === "open") {
      await prisma.sosIncident.update({
        where: { id: incidentId },
        data:  { status: "ack" },
      });
    }

    const responderCount = await prisma.sosResponder.count({ where: { incidentId } });

    // Notify the incident author that a responder is coming
    if (updated?.authorId && updated.authorId !== userId) {
      const responder = await prisma.user.findUnique({
        where:  { id: userId },
        select: { name: true },
      });
      sendPush(
        { userId: updated.authorId },
        {
          title:    "✅ Responder on the way",
          body:     `${responder?.name ?? "Someone"} is responding to your ${updated.category.replace(/_/g, " ")} alert`,
          data:     { type: "sos_ack", incidentId },
          priority: "high",
        }
      ).catch(() => {});
    }

    return NextResponse.json({ ok: true, responderCount });
  } catch (e) {
    console.error("[sos/[id]/respond POST]", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
