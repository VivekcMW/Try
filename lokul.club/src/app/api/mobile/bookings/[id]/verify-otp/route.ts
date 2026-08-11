/**
 * POST /api/mobile/bookings/[id]/verify-otp — { otp, actorId }
 * Provider verifies the customer's start-of-work OTP.
 * slot bookings → checked_in; window bookings → in_progress.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BOOKING_INCLUDE, E2E, logBookingStatus } from "@/lib/bookings";
import type { BookingStatus } from "@/generated/prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (E2E) return NextResponse.json({ id, verified: true });

  try {
    const { otp, actorId } = await req.json();
    if (!otp) return NextResponse.json({ error: "otp required" }, { status: 400 });

    const booking = await prisma.serviceBooking.findUnique({ where: { id } });
    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    if (booking.otp !== String(otp)) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 401 });
    }

    const next: BookingStatus = booking.kind === "slot" ? "checked_in" : "in_progress";

    const updated = await prisma.$transaction(async (tx) => {
      await logBookingStatus(tx, id, booking.status, next, actorId ?? booking.merchantId, "OTP verified");
      return tx.serviceBooking.update({
        where: { id },
        data: { status: next },
        include: BOOKING_INCLUDE,
      });
    });

    return NextResponse.json({ verified: true, booking: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
