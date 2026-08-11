/**
 * GET  /api/mobile/bookings  — list bookings (?userId= | ?merchantId=, ?status=, ?kind=)
 * POST /api/mobile/bookings  — create a booking (slot | window | project)
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BOOKING_INCLUDE, E2E, generateOtp, logBookingStatus } from "@/lib/bookings";
import type { BookingKind, BookingStatus } from "@/generated/prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const userId = searchParams.get("userId");
  const merchantId = searchParams.get("merchantId");
  const status = searchParams.get("status");
  const kind = searchParams.get("kind");

  if (!userId && !merchantId) {
    return NextResponse.json({ error: "userId or merchantId required" }, { status: 400 });
  }
  if (E2E) return NextResponse.json({ items: [] });

  try {
    const items = await prisma.serviceBooking.findMany({
      where: {
        ...(userId ? { customerId: userId } : {}),
        ...(merchantId ? { merchantId } : {}),
        ...(status ? { status: status as BookingStatus } : {}),
        ...(kind ? { kind: kind as BookingKind } : {}),
      },
      include: BOOKING_INCLUDE,
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}

export async function POST(req: NextRequest) {
  if (E2E) return NextResponse.json({ id: "e2e-booking", status: "requested" }, { status: 201 });

  try {
    const body = await req.json();
    const {
      userId, merchantId, staffId, kind, category, date, slotLabel, slotId,
      services, address, locationType, fromAddress, toAddress, bookingFor,
      petName, inventory, fastingRequired, roomCount, recurrence, consultMode,
      problem, problemPhotoUrl, urgency, visitFeePaise, totalPaise,
      legs, milestones,
    } = body;

    if (!userId || !merchantId || !kind || !date || !slotLabel) {
      return NextResponse.json(
        { error: "userId, merchantId, kind, date, slotLabel required" },
        { status: 400 }
      );
    }
    if (!["slot", "window", "project"].includes(kind)) {
      return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
    }

    if (slotId) {
      const slot = await prisma.serviceSlot.findUnique({ where: { id: slotId } });
      if (!slot) return NextResponse.json({ error: "Slot not found" }, { status: 404 });
      if (slot.booked >= slot.capacity) {
        return NextResponse.json({ error: "Slot fully booked" }, { status: 409 });
      }
    }

    const initialStatus: BookingStatus = kind === "project" ? "visit_scheduled" : "requested";

    const booking = await prisma.$transaction(async (tx) => {
      const b = await tx.serviceBooking.create({
        data: {
          customerId: userId,
          merchantId,
          staffId: staffId ?? null,
          kind,
          status: initialStatus,
          category: category ?? "",
          date,
          slotLabel,
          slotId: slotId ?? null,
          address: address ?? null,
          locationType: locationType ?? null,
          fromAddress: fromAddress ?? null,
          toAddress: toAddress ?? null,
          bookingFor: bookingFor ?? null,
          petName: petName ?? null,
          inventory: inventory ?? null,
          fastingRequired: fastingRequired ?? false,
          roomCount: roomCount ?? null,
          recurrence: recurrence ?? undefined,
          consultMode: consultMode ?? null,
          problem: problem ?? null,
          problemPhotoUrl: problemPhotoUrl ?? null,
          urgency: urgency ?? null,
          visitFeePaise: visitFeePaise ?? null,
          totalPaise: totalPaise ?? 0,
          otp: generateOtp(),
          items: {
            create: (Array.isArray(services) ? services : []).map(
              (s: { name: string; pricePaise: number; durationMins?: number }) => ({
                name: s.name,
                pricePaise: s.pricePaise ?? 0,
                durationMins: s.durationMins ?? null,
              })
            ),
          },
          legs: {
            create: (Array.isArray(legs) ? legs : []).map(
              (l: { legType: string; date: string; slotLabel: string }) => ({
                legType: l.legType,
                date: l.date,
                slotLabel: l.slotLabel,
              })
            ),
          },
          milestones: {
            create: (Array.isArray(milestones) ? milestones : []).map(
              (m: { label: string }, i: number) => ({ label: m.label, sortOrder: i })
            ),
          },
        },
        include: BOOKING_INCLUDE,
      });
      if (slotId) {
        await tx.serviceSlot.update({ where: { id: slotId }, data: { booked: { increment: 1 } } });
      }
      await logBookingStatus(tx, b.id, null, initialStatus, userId);
      return b;
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
