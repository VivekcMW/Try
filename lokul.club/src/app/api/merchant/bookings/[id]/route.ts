import { NextRequest, NextResponse } from "next/server";
import { requireMerchant } from "@/lib/merchant-auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { merchantId } = await requireMerchant();
  const { id } = await params;

  const appointment = await prisma.appointment.findFirst({
    where: { id, merchantId },
    include: {
      user: { select: { id: true, name: true, phone: true, avatarUrl: true } },
      slot: { select: { date: true, startTime: true, endTime: true } },
    },
  });

  if (!appointment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ appointment });
}
