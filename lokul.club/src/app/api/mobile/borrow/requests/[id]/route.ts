/**
 * PATCH /api/mobile/borrow/requests/[id] — approve or decline a borrow request
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { status } = await req.json();
    if (status !== "approved" && status !== "declined") {
      return NextResponse.json({ error: "status must be approved or declined" }, { status: 400 });
    }

    const existing = await prisma.borrowRequest.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const request = await prisma.borrowRequest.update({
      where: { id },
      data: { status },
      include: {
        item: { select: { id: true, name: true } },
        requester: { select: { id: true, name: true } },
      },
    });

    if (status === "approved") {
      await prisma.borrowItem.update({
        where: { id: existing.itemId },
        data: { available: false, borrowCount: { increment: 1 } },
      });
    }

    return NextResponse.json({ request });
  } catch {
    return NextResponse.json({ error: "Failed to update request" }, { status: 400 });
  }
}
