/**
 * PATCH /api/mobile/parking/visitor-requests/[id] — approve/reject/update a visitor request
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const STATUSES = ["pending", "approved", "rejected", "active", "completed"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { status } = await req.json();
    if (!status || !STATUSES.includes(status)) {
      return NextResponse.json({ error: "invalid status" }, { status: 400 });
    }

    const request = await prisma.parkingVisitorRequest.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ request });
  } catch {
    return NextResponse.json({ error: "Failed to update request" }, { status: 400 });
  }
}
