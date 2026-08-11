/**
 * PATCH /api/mobile/bookings/[id]/milestones — { actorId, milestoneId } mark done
 * When all milestones are done the booking moves to work_done.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BOOKING_INCLUDE, E2E, logBookingStatus } from "@/lib/bookings";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (E2E) return NextResponse.json({ id, status: "in_progress" });

  try {
    const { actorId, milestoneId } = await req.json();
    if (!milestoneId) return NextResponse.json({ error: "milestoneId required" }, { status: 400 });

    const booking = await prisma.serviceBooking.findUnique({
      where: { id },
      include: { milestones: true, merchant: { select: { ownerId: true } } },
    });
    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    const exists = booking.milestones.some((m) => m.id === milestoneId);
    if (!exists) return NextResponse.json({ error: "Milestone not found" }, { status: 404 });

    const allDone = booking.milestones.every((m) => m.id === milestoneId || m.done);

    const updated = await prisma.$transaction(async (tx) => {
      await tx.bookingMilestone.update({
        where: { id: milestoneId },
        data: { done: true, doneAt: new Date() },
      });
      if (allDone && booking.status !== "work_done") {
        await tx.serviceBooking.update({ where: { id }, data: { status: "work_done" } });
        await logBookingStatus(
          tx, id, booking.status, "work_done",
          actorId ?? booking.merchant.ownerId, "All milestones complete"
        );
      }
      return tx.serviceBooking.findUnique({ where: { id }, include: BOOKING_INCLUDE });
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
