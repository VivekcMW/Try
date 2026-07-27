/**
 * POST /api/mobile/kids/activities/[id]/enroll — take one spot in an activity
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const activity = await prisma.kidsActivity.findUnique({ where: { id } });
    if (!activity) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (activity.spotsLeft <= 0) {
      return NextResponse.json({ error: "Fully booked" }, { status: 409 });
    }

    const updated = await prisma.kidsActivity.update({
      where: { id },
      data: { spotsLeft: { decrement: 1 } },
    });

    return NextResponse.json({ activity: updated });
  } catch {
    return NextResponse.json({ error: "Failed to enroll" }, { status: 400 });
  }
}
