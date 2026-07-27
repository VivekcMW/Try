/**
 * POST   /api/mobile/carpool/[id]/join  — join a carpool trip
 * DELETE /api/mobile/carpool/[id]/join  — cancel join request
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: tripId } = await params;
  try {
    const { passengerId, seats, message } = await req.json();
    if (!passengerId) return NextResponse.json({ error: "passengerId required" }, { status: 400 });

    const trip = await prisma.carpoolTrip.findUnique({ where: { id: tripId } });
    if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    if (trip.status !== "open") return NextResponse.json({ error: "Trip not open" }, { status: 409 });
    if (trip.driverId === passengerId) return NextResponse.json({ error: "Driver cannot join own trip" }, { status: 409 });

    const requestedSeats = seats ?? 1;
    if (trip.seatsLeft < requestedSeats) {
      return NextResponse.json({ error: "Not enough seats" }, { status: 409 });
    }

    const join = await prisma.$transaction(async (tx) => {
      const j = await tx.carpoolJoin.upsert({
        where: { tripId_passengerId: { tripId, passengerId } },
        update: { status: "confirmed", seats: requestedSeats, message },
        create: { tripId, passengerId, seats: requestedSeats, status: "confirmed", message },
      });
      const newSeatsLeft = trip.seatsLeft - requestedSeats;
      await tx.carpoolTrip.update({
        where: { id: tripId },
        data: {
          seatsLeft: newSeatsLeft,
          status: newSeatsLeft <= 0 ? "full" : "open",
        },
      });
      return j;
    });
    const updatedTrip = await prisma.carpoolTrip.findUnique({ where: { id: tripId }, select: { seatsLeft: true, status: true } });
    return NextResponse.json({ ...join, seatsLeft: updatedTrip?.seatsLeft, tripStatus: updatedTrip?.status }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: tripId } = await params;
  try {
    const { passengerId } = await req.json();
    if (!passengerId) return NextResponse.json({ error: "passengerId required" }, { status: 400 });

    const join = await prisma.carpoolJoin.findUnique({
      where: { tripId_passengerId: { tripId, passengerId } },
    });
    if (!join) return NextResponse.json({ error: "Join not found" }, { status: 404 });

    await prisma.$transaction(async (tx) => {
      await tx.carpoolJoin.delete({ where: { tripId_passengerId: { tripId, passengerId } } });
      await tx.carpoolTrip.update({
        where: { id: tripId },
        data: { seatsLeft: { increment: join.seats }, status: "open" },
      });
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
