import { NextRequest, NextResponse } from "next/server";
import { requireMerchant } from "@/lib/merchant-auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { merchantId } = await requireMerchant();
  const { id } = await params;
  const body = await request.json();
  const { action, pausedUntil } = body;

  const existing = await prisma.subscription.findFirst({
    where: { id, merchantId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
  }

  let updateData: Record<string, unknown> = {};

  if (action === "pause") {
    updateData = {
      status: "paused",
      pausedFrom: new Date(),
      pausedUntil: pausedUntil ? new Date(pausedUntil) : null,
    };
  } else if (action === "resume") {
    updateData = {
      status: "active",
      pausedFrom: null,
      pausedUntil: null,
    };
  } else if (action === "cancel") {
    updateData = {
      status: "cancelled",
      cancelledAt: new Date(),
    };
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const subscription = await prisma.subscription.update({
    where: { id },
    data: updateData,
  });
  return NextResponse.json({ subscription });
}
