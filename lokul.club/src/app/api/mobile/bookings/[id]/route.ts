/**
 * GET   /api/mobile/bookings/[id]  — booking detail (tracker polls this)
 * PATCH /api/mobile/bookings/[id]  — status transition { status, actorId, reason? }
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BOOKING_INCLUDE, E2E, logBookingStatus } from "@/lib/bookings";
import type { BookingStatus } from "@/generated/prisma/client";

// Valid transitions per current status (cancel/rate handled by dedicated routes)
const TRANSITIONS: Partial<Record<BookingStatus, BookingStatus[]>> = {
  requested: ["confirmed", "accepted"],
  confirmed: ["checked_in", "completed"],
  checked_in: ["completed"],
  accepted: ["on_the_way"],
  on_the_way: ["arrived"],
  arrived: ["in_progress", "quote_pending"],
  quote_pending: ["in_progress"],
  in_progress: ["work_done", "completed"],
  work_done: ["completed"],
  visit_scheduled: ["visit_done"],
  visit_done: ["quote_shared"],
  quote_shared: ["quote_accepted"],
  quote_accepted: ["scheduled"],
  scheduled: ["in_progress", "work_done"],
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (E2E) return NextResponse.json({ id, status: "requested" });

  try {
    const booking = await prisma.serviceBooking.findUnique({
      where: { id },
      include: BOOKING_INCLUDE,
    });
    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    return NextResponse.json(booking);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (E2E) return NextResponse.json({ id, status: "confirmed" });

  try {
    const { status, actorId, reason } = await req.json();
    if (!status || !actorId) {
      return NextResponse.json({ error: "status and actorId required" }, { status: 400 });
    }

    const booking = await prisma.serviceBooking.findUnique({
      where: { id },
      include: { merchant: { select: { ownerId: true } } },
    });
    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    if (actorId !== booking.customerId && actorId !== booking.merchant.ownerId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const allowed = TRANSITIONS[booking.status] ?? [];
    if (!allowed.includes(status as BookingStatus)) {
      return NextResponse.json(
        { error: `Cannot go from ${booking.status} to ${status}` },
        { status: 409 }
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      await logBookingStatus(tx, id, booking.status, status as BookingStatus, actorId, reason);
      return tx.serviceBooking.update({
        where: { id },
        data: {
          status: status as BookingStatus,
          ...(status === "completed" ? { completedAt: new Date() } : {}),
        },
        include: BOOKING_INCLUDE,
      });
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
