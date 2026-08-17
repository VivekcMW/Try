/**
 * GET  /api/mobile/telemedicine/appointments — a user's appointments
 * POST /api/mobile/telemedicine/appointments — book an appointment
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isFeatureEnabled } from "@/lib/feature-flags-server";

const MODES = ["video", "audio", "in_person", "instant"];

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  try {
    const appointments = await prisma.telemedAppointment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ appointments });
  } catch {
    return NextResponse.json({ error: "Failed to load appointments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, doctorId, doctorName, specialty, mode, dateLabel, timeLabel, reason } = await req.json();

    if (!(await isFeatureEnabled("telemedicine", { userId }))) {
      return NextResponse.json({ error: "Telemedicine is currently unavailable" }, { status: 403 });
    }

    if (!userId || !doctorName || !specialty || !mode || !dateLabel || !timeLabel) {
      return NextResponse.json({ error: "userId, doctorName, specialty, mode, dateLabel, timeLabel required" }, { status: 400 });
    }
    if (!MODES.includes(mode)) {
      return NextResponse.json({ error: "invalid mode" }, { status: 400 });
    }

    const appointment = await prisma.telemedAppointment.create({
      data: { userId, doctorId: doctorId ?? null, doctorName, specialty, mode, dateLabel, timeLabel, reason: reason ?? null },
    });

    return NextResponse.json({ appointment }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to book appointment" }, { status: 400 });
  }
}
