/**
 * GET  /api/mobile/amenity/bookings?ownerId= — a resident's amenity bookings
 * POST /api/mobile/amenity/bookings — book an amenity (debits the wallet atomically)
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const ownerId = req.nextUrl.searchParams.get("ownerId");
  if (!ownerId) return NextResponse.json({ error: "ownerId required" }, { status: 400 });

  try {
    const bookings = await prisma.amenityBooking.findMany({
      where: { ownerId },
      orderBy: { dateISO: "asc" },
    });
    return NextResponse.json({ bookings });
  } catch {
    return NextResponse.json({ error: "Failed to load bookings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      ownerId, amenityId, amenityName, amenityIcon, dateLabel, dateISO, timeSlot, totalPricePaise, pinCode,
    } = await req.json();

    if (!ownerId || !amenityId || !amenityName || !dateLabel || !dateISO || !timeSlot || totalPricePaise == null || !pinCode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (totalPricePaise > 0) {
      const user = await prisma.user.findUnique({ where: { id: ownerId }, select: { walletBalancePaise: true } });
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
      if (user.walletBalancePaise < totalPricePaise) {
        return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 422 });
      }
    }

    const bookingRef = `LOK-${amenityName.slice(0, 2).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;

    const booking = await prisma.$transaction(async (tx) => {
      if (totalPricePaise > 0) {
        await tx.user.update({
          where: { id: ownerId },
          data: { walletBalancePaise: { decrement: totalPricePaise } },
        });
        await tx.walletEntry.create({
          data: {
            userId: ownerId,
            type: "spend",
            amountPaise: -totalPricePaise,
            description: `Amenity booking: ${amenityName}`,
            status: "completed",
          },
        });
      }

      return tx.amenityBooking.create({
        data: {
          ownerId, amenityId, amenityName, amenityIcon,
          dateLabel, dateISO: new Date(dateISO), timeSlot,
          bookingRef, totalPricePaise, pinCode,
        },
      });
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 400 });
  }
}
