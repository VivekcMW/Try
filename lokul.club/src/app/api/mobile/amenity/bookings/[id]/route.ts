/**
 * GET   /api/mobile/amenity/bookings/[id] — booking detail
 * PATCH /api/mobile/amenity/bookings/[id] — cancel a booking
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const booking = await prisma.amenityBooking.findUnique({ where: { id } });
    if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ booking });
  } catch {
    return NextResponse.json({ error: "Failed to load booking" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { status } = await req.json();
    if (status !== "cancelled") {
      return NextResponse.json({ error: "status must be cancelled" }, { status: 400 });
    }

    const existing = await prisma.amenityBooking.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (existing.status !== "upcoming") {
      return NextResponse.json({ error: "Only upcoming bookings can be cancelled" }, { status: 409 });
    }

    const booking = await prisma.$transaction(async (tx) => {
      if (existing.totalPricePaise > 0) {
        await tx.user.update({
          where: { id: existing.ownerId },
          data: { walletBalancePaise: { increment: existing.totalPricePaise } },
        });
        await tx.walletEntry.create({
          data: {
            userId: existing.ownerId,
            type: "refund",
            amountPaise: existing.totalPricePaise,
            description: `Refund: ${existing.amenityName} booking cancelled`,
            status: "completed",
          },
        });
      }

      return tx.amenityBooking.update({
        where: { id },
        data: { status: "cancelled" },
      });
    });

    return NextResponse.json({ booking });
  } catch {
    return NextResponse.json({ error: "Failed to cancel booking" }, { status: 400 });
  }
}
