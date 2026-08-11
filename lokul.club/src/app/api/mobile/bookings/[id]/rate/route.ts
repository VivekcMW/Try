/**
 * POST /api/mobile/bookings/[id]/rate — { userId, rating: 1-5, review? }
 * Only the customer, only after completion. Updates merchant rating aggregate.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { E2E } from "@/lib/bookings";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (E2E) return NextResponse.json({ id, rating: 5 });

  try {
    const { userId, rating, review } = await req.json();
    if (!userId || typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "userId and rating (1-5) required" }, { status: 400 });
    }

    const booking = await prisma.serviceBooking.findUnique({ where: { id } });
    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    if (userId !== booking.customerId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (booking.status !== "completed") {
      return NextResponse.json({ error: "Booking not completed yet" }, { status: 409 });
    }
    if (booking.rating !== null) {
      return NextResponse.json({ error: "Already rated" }, { status: 409 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const b = await tx.serviceBooking.update({
        where: { id },
        data: { rating, review: review ?? null },
      });
      const merchant = await tx.merchant.findUnique({
        where: { id: booking.merchantId },
        select: { ratingAvg: true, ratingCount: true },
      });
      if (merchant) {
        const count = merchant.ratingCount + 1;
        const avg = ((merchant.ratingAvg ?? 0) * merchant.ratingCount + rating) / count;
        await tx.merchant.update({
          where: { id: booking.merchantId },
          data: { ratingAvg: avg, ratingCount: count },
        });
      }
      return b;
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
