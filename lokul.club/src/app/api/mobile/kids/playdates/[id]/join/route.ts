/**
 * POST /api/mobile/kids/playdates/[id]/join — join a playdate (idempotent per user)
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { userId, kidName } = await req.json();
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const playdate = await prisma.kidsPlaydate.findUnique({ where: { id } });
    if (!playdate) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const existing = await prisma.kidsPlaydateAttendee.findUnique({
      where: { playdateId_userId: { playdateId: id, userId } },
    });
    if (existing) {
      return NextResponse.json({ playdate });
    }
    if (playdate.spotsLeft <= 0) {
      return NextResponse.json({ error: "Playdate full" }, { status: 409 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.kidsPlaydateAttendee.create({
        data: { playdateId: id, userId, kidName: kidName || "You" },
      });
      return tx.kidsPlaydate.update({
        where: { id },
        data: { spotsLeft: { decrement: 1 } },
        include: { attendees: { select: { id: true, kidName: true } } },
      });
    });

    return NextResponse.json({ playdate: updated });
  } catch {
    return NextResponse.json({ error: "Failed to join playdate" }, { status: 400 });
  }
}
