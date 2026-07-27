/**
 * POST /api/mobile/telemedicine/lab-bookings — book a lab test
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId, testId, testName, pricePaise, dateLabel, timeLabel } = await req.json();

    if (!userId || !testId || !testName || typeof pricePaise !== "number" || !dateLabel || !timeLabel) {
      return NextResponse.json({ error: "userId, testId, testName, pricePaise, dateLabel, timeLabel required" }, { status: 400 });
    }

    const booking = await prisma.telemedLabBooking.create({
      data: { userId, testId, testName, pricePaise, dateLabel, timeLabel },
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to book test" }, { status: 400 });
  }
}
