/**
 * GET   /api/mobile/telemedicine/appointments/[id] — appointment detail
 * PATCH /api/mobile/telemedicine/appointments/[id] — cancel/complete
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const STATUSES = ["upcoming", "completed", "cancelled"];

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const appointment = await prisma.telemedAppointment.findUnique({ where: { id } });
    if (!appointment) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ appointment });
  } catch {
    return NextResponse.json({ error: "Failed to load appointment" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { status } = await req.json();
    if (!STATUSES.includes(status)) {
      return NextResponse.json({ error: "invalid status" }, { status: 400 });
    }

    const appointment = await prisma.telemedAppointment.update({ where: { id }, data: { status } });
    return NextResponse.json({ appointment });
  } catch {
    return NextResponse.json({ error: "Failed to update appointment" }, { status: 400 });
  }
}
