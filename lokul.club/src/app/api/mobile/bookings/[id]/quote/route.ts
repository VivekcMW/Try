/**
 * POST  /api/mobile/bookings/[id]/quote — merchant shares project quote
 *       { actorId, lineItems: [{label,pricePaise}], totalPaise } → quote_shared
 * PATCH /api/mobile/bookings/[id]/quote — quote negotiation
 *       { actorId, action: "accept" }                    → customer accepts, 20% advance
 *       { actorId, action: "counter", counterPaise }     → customer counter-offer
 *       { actorId, action: "accept-counter" }            → merchant accepts counter
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BOOKING_INCLUDE, E2E, logBookingStatus } from "@/lib/bookings";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (E2E) return NextResponse.json({ id, status: "quote_shared" });

  try {
    const { actorId, lineItems, totalPaise } = await req.json();
    if (!Array.isArray(lineItems) || typeof totalPaise !== "number") {
      return NextResponse.json({ error: "lineItems and totalPaise required" }, { status: 400 });
    }

    const booking = await prisma.serviceBooking.findUnique({
      where: { id },
      include: { merchant: { select: { ownerId: true } } },
    });
    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    const updated = await prisma.$transaction(async (tx) => {
      await tx.bookingQuote.create({
        data: { bookingId: id, type: "project", lineItems, totalPaise },
      });
      await logBookingStatus(tx, id, booking.status, "quote_shared", actorId ?? booking.merchant.ownerId);
      return tx.serviceBooking.update({
        where: { id },
        data: { status: "quote_shared" },
        include: BOOKING_INCLUDE,
      });
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

type QuoteBooking = NonNullable<
  Awaited<ReturnType<typeof loadBookingWithQuote>>
>;

async function loadBookingWithQuote(id: string) {
  return prisma.serviceBooking.findUnique({
    where: { id },
    include: {
      merchant: { select: { ownerId: true } },
      quotes: { where: { type: "project" }, orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
}

function authError(action: string, actorId: string | undefined, booking: QuoteBooking) {
  if (!actorId) return null;
  const mustBe = action === "accept-counter" ? booking.merchant.ownerId : booking.customerId;
  return actorId === mustBe ? null : NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

async function handleCounter(id: string, booking: QuoteBooking, counterPaise: unknown) {
  if (typeof counterPaise !== "number" || counterPaise <= 0) {
    return NextResponse.json({ error: "counterPaise required" }, { status: 400 });
  }
  await prisma.bookingQuote.update({
    where: { id: booking.quotes[0].id },
    data: { counterPaise, status: "countered" },
  });
  const b = await prisma.serviceBooking.findUnique({ where: { id }, include: BOOKING_INCLUDE });
  return NextResponse.json(b);
}

async function handleAccept(id: string, booking: QuoteBooking, action: string, actorId?: string) {
  const quote = booking.quotes[0];
  const finalPaise = action === "accept-counter" ? quote.counterPaise : quote.totalPaise;
  if (!finalPaise) return NextResponse.json({ error: "No counter offer to accept" }, { status: 409 });

  const updated = await prisma.$transaction(async (tx) => {
    await tx.bookingQuote.update({
      where: { id: quote.id },
      data: { status: "accepted", totalPaise: finalPaise },
    });
    await logBookingStatus(
      tx, id, booking.status, "quote_accepted",
      actorId ?? booking.customerId,
      action === "accept-counter" ? "Counter-offer accepted" : "Quote accepted"
    );
    return tx.serviceBooking.update({
      where: { id },
      data: {
        status: "quote_accepted",
        totalPaise: finalPaise,
        advancePaise: Math.round(finalPaise * 0.2),
      },
      include: BOOKING_INCLUDE,
    });
  });

  return NextResponse.json(updated);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (E2E) return NextResponse.json({ id, status: "quote_accepted" });

  try {
    const { actorId, action, counterPaise } = await req.json();
    if (!["accept", "counter", "accept-counter"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const booking = await loadBookingWithQuote(id);
    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    if (booking.quotes.length === 0) {
      return NextResponse.json({ error: "No project quote" }, { status: 409 });
    }

    const forbidden = authError(action, actorId, booking);
    if (forbidden) return forbidden;

    if (action === "counter") return handleCounter(id, booking, counterPaise);
    return handleAccept(id, booking, action, actorId);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
