/**
 * GET  /api/mobile/kids/playdates — upcoming playdates for a pinCode
 * POST /api/mobile/kids/playdates — host a playdate (host is automatically the first attendee)
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const pinCode = req.nextUrl.searchParams.get("pinCode");
  if (!pinCode) return NextResponse.json({ error: "pinCode required" }, { status: 400 });

  try {
    const playdates = await prisma.kidsPlaydate.findMany({
      where: { pinCode },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        host: { select: { id: true, name: true } },
        attendees: { select: { id: true, kidName: true } },
      },
    });
    return NextResponse.json({ playdates });
  } catch {
    return NextResponse.json({ error: "Failed to load playdates" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      hostId, title, childName, ageGroup, dateLabel, timeLabel, location, notes, totalSpots, pinCode,
    } = await req.json();

    if (!hostId || !title || !childName || !ageGroup || !dateLabel || !timeLabel || !location || !totalSpots || !pinCode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const playdate = await prisma.$transaction(async (tx) => {
      const created = await tx.kidsPlaydate.create({
        data: {
          hostId, title, ageGroup, dateLabel, timeLabel, location,
          notes: notes || null,
          totalSpots,
          spotsLeft: Math.max(totalSpots - 1, 0),
          pinCode,
        },
      });
      await tx.kidsPlaydateAttendee.create({
        data: { playdateId: created.id, userId: hostId, kidName: childName },
      });
      return tx.kidsPlaydate.findUnique({
        where: { id: created.id },
        include: {
          host: { select: { id: true, name: true } },
          attendees: { select: { id: true, kidName: true } },
        },
      });
    });

    return NextResponse.json({ playdate }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create playdate" }, { status: 400 });
  }
}
