/**
 * POST  /api/mobile/bookings/[id]/onsite-quote — merchant posts extra-work quote
 *       { actorId, label, pricePaise }        → status quote_pending
 * PATCH /api/mobile/bookings/[id]/onsite-quote — customer approves
 *       { actorId }                            → total += price, status in_progress
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BOOKING_INCLUDE, E2E, logBookingStatus } from "@/lib/bookings";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (E2E) return NextResponse.json({ id, status: "quote_pending" });

  try {
    const { actorId, label, pricePaise } = await req.json();
    if (!label || typeof pricePaise !== "number") {
      return NextResponse.json({ error: "label and pricePaise required" }, { status: 400 });
    }

    const booking = await prisma.serviceBooking.findUnique({
      where: { id },
      include: { merchant: { select: { ownerId: true } } },
    });
    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    const updated = await prisma.$transaction(async (tx) => {
      await tx.bookingQuote.create({
        data: { bookingId: id, type: "onsite", label, totalPaise: pricePaise },
      });
      await logBookingStatus(tx, id, booking.status, "quote_pending", actorId ?? booking.merchant.ownerId, label);
      return tx.serviceBooking.update({
        where: { id },
        data: { status: "quote_pending" },
        include: BOOKING_INCLUDE,
      });
    });

    return NextResponse.json(updated);
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
  if (E2E) return NextResponse.json({ id, status: "in_progress" });

  try {
    const { actorId } = await req.json();

    const booking = await prisma.serviceBooking.findUnique({
      where: { id },
      include: { quotes: { where: { type: "onsite", status: "pending" }, orderBy: { createdAt: "desc" }, take: 1 } },
    });
    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    if (actorId && actorId !== booking.customerId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const quote = booking.quotes[0];
    if (!quote) return NextResponse.json({ error: "No pending on-site quote" }, { status: 409 });

    const updated = await prisma.$transaction(async (tx) => {
      await tx.bookingQuote.update({ where: { id: quote.id }, data: { status: "approved" } });
      await logBookingStatus(tx, id, booking.status, "in_progress", booking.customerId, "On-site quote approved");
      return tx.serviceBooking.update({
        where: { id },
        data: {
          status: "in_progress",
          totalPaise: booking.totalPaise + quote.totalPaise,
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
