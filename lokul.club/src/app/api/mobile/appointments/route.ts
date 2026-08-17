/**
 * GET  /api/mobile/appointments   — list appointments for a user or merchant
 * POST /api/mobile/appointments   — create an appointment
 *
 * GET params: userId | merchantId (at least one required)
 * POST body:  { userId, merchantId, slotId?, serviceLabel, scheduledAt, notesForMerchant? }
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { e2eReserve } from "@/lib/e2e-escrow";
import { hasRealDatabaseConfig, isE2eMode } from "@/lib/data-source-guard";

const E2E = isE2eMode();

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const userId     = searchParams.get("userId");
  const merchantId = searchParams.get("merchantId");

  if (!userId && !merchantId) {
    return NextResponse.json({ error: "userId or merchantId required" }, { status: 400 });
  }

  if (E2E) return NextResponse.json({ items: [] });
  if (!hasRealDatabaseConfig()) {
    return NextResponse.json({ items: [], warning: "No live database configured" }, { status: 503 });
  }

  try {
    const items = await prisma.appointment.findMany({
      where: {
        ...(userId     ? { userId }     : {}),
        ...(merchantId ? { merchantId } : {}),
      },
      include: {
        user:     { select: { id: true, name: true, avatarUrl: true } },
        merchant: { select: { id: true, name: true } },
        slot:     true,
      },
      orderBy: { scheduledAt: "asc" },
      take: 50,
    });
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}

export async function POST(req: NextRequest) {
  if (E2E) {
    const body = (await req.json().catch(() => ({}))) as { slotId?: string | null };
    const r = await e2eReserve(body.slotId ?? null);
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: r.status });
    return NextResponse.json({ id: r.appointmentId, status: "pending" }, { status: 201 });
  }

  try {
    const {
      userId, merchantId, slotId, serviceLabel, scheduledAt, notesForMerchant,
    } = await req.json();

    if (!userId || !merchantId || !serviceLabel || !scheduledAt) {
      return NextResponse.json({ error: "userId, merchantId, serviceLabel, scheduledAt required" }, { status: 400 });
    }

    // If slotId provided, check capacity
    if (slotId) {
      const slot = await prisma.serviceSlot.findUnique({ where: { id: slotId } });
      if (!slot) return NextResponse.json({ error: "Slot not found" }, { status: 404 });
      if (slot.booked >= slot.capacity) return NextResponse.json({ error: "Slot fully booked" }, { status: 409 });
    }

    const appt = await prisma.$transaction(async (tx) => {
      const a = await tx.appointment.create({
        data: {
          userId, merchantId, slotId: slotId ?? null,
          serviceLabel,
          scheduledAt: new Date(scheduledAt),
          notesForMerchant: notesForMerchant ?? null,
          status: "pending",
        },
      });
      // Increment slot booked count
      if (slotId) {
        await tx.serviceSlot.update({ where: { id: slotId }, data: { booked: { increment: 1 } } });
      }
      return a;
    });

    return NextResponse.json(appt, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
