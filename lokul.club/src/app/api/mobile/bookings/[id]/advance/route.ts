/**
 * POST /api/mobile/bookings/[id]/advance — { userId, method: "wallet" | "upi" | "cod" }
 * Pay the 20% project advance → status scheduled.
 * Wallet method debits the user's wallet balance atomically.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BOOKING_INCLUDE, E2E, logBookingStatus } from "@/lib/bookings";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (E2E) return NextResponse.json({ id, status: "scheduled" });

  try {
    const { userId, method } = await req.json();
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const booking = await prisma.serviceBooking.findUnique({ where: { id } });
    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    if (userId !== booking.customerId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (booking.status !== "quote_accepted" || !booking.advancePaise) {
      return NextResponse.json({ error: "No advance due" }, { status: 409 });
    }
    if (booking.advancePaid) {
      return NextResponse.json({ error: "Advance already paid" }, { status: 409 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (method === "wallet") {
        // Conditional debit — first writer wins, no double spend
        const debited = await tx.user.updateMany({
          where: { id: userId, walletBalancePaise: { gte: booking.advancePaise! } },
          data: { walletBalancePaise: { decrement: booking.advancePaise! } },
        });
        if (debited.count === 0) throw new Error("INSUFFICIENT_BALANCE");
        await tx.walletEntry.create({
          data: {
            userId,
            type: "spend",
            status: "completed",
            amountPaise: -booking.advancePaise!,
            description: `Advance for booking ${id}`,
            reference: id,
          },
        });
      }
      await logBookingStatus(tx, id, booking.status, "scheduled", userId, `Advance paid (${method ?? "offline"})`);
      return tx.serviceBooking.update({
        where: { id },
        data: { advancePaid: true, status: "scheduled" },
        include: BOOKING_INCLUDE,
      });
    });

    return NextResponse.json(updated);
  } catch (e) {
    if (e instanceof Error && e.message === "INSUFFICIENT_BALANCE") {
      return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 402 });
    }
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
