/**
 * POST /api/mobile/bookings/[id]/cancel — { userId, reason }
 * Cancel is locked once work has been accepted AND paid (advance or in progress).
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BOOKING_INCLUDE, E2E, logBookingStatus } from "@/lib/bookings";

const LOCKED_STATUSES = ["in_progress", "work_done", "completed", "cancelled"] as const;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (E2E) return NextResponse.json({ id, status: "cancelled" });

  try {
    const { userId, reason } = await req.json();
    if (!userId || !reason) {
      return NextResponse.json({ error: "userId and reason required" }, { status: 400 });
    }

    const booking = await prisma.serviceBooking.findUnique({
      where: { id },
      include: { merchant: { select: { ownerId: true } } },
    });
    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    if (userId !== booking.customerId && userId !== booking.merchant.ownerId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (
      (LOCKED_STATUSES as readonly string[]).includes(booking.status) ||
      booking.advancePaid
    ) {
      return NextResponse.json(
        { error: "Booking can no longer be cancelled" },
        { status: 409 }
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      await logBookingStatus(tx, id, booking.status, "cancelled", userId, reason);
      if (booking.slotId) {
        await tx.serviceSlot.update({
          where: { id: booking.slotId },
          data: { booked: { decrement: 1 } },
        });
      }
      return tx.serviceBooking.update({
        where: { id },
        data: { status: "cancelled", cancellationReason: reason, cancelledAt: new Date() },
        include: BOOKING_INCLUDE,
      });
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
