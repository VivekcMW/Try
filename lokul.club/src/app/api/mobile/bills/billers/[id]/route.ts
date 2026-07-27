/**
 * PATCH /api/mobile/bills/billers/[id] — toggle reminder or update status
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await req.json();
    const { reminderEnabled, status } = body;

    const existing = await prisma.savedBiller.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const biller = await prisma.savedBiller.update({
      where: { id },
      data: {
        ...(reminderEnabled !== undefined ? { reminderEnabled } : { reminderEnabled: !existing.reminderEnabled }),
        ...(status !== undefined ? { status } : {}),
      },
    });

    return NextResponse.json({ biller });
  } catch {
    return NextResponse.json({ error: "Failed to update biller" }, { status: 400 });
  }
}
