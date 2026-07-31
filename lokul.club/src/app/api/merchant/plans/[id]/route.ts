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
  const { name, description, pricePaise, frequency, unit, isActive } = body;

  const existing = await prisma.subscriptionPlan.findFirst({
    where: { id, merchantId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  const plan = await prisma.subscriptionPlan.update({
    where: { id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(description !== undefined && { description: description?.trim() || null }),
      ...(pricePaise !== undefined && { pricePaise }),
      ...(frequency !== undefined && { frequency }),
      ...(unit !== undefined && { unit: unit?.trim() || null }),
      ...(isActive !== undefined && { isActive }),
    },
  });
  return NextResponse.json({ plan });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { merchantId } = await requireMerchant();
  const { id } = await params;

  const existing = await prisma.subscriptionPlan.findFirst({
    where: { id, merchantId },
    include: { _count: { select: { subscriptions: { where: { status: "active" } } } } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }
  if (existing._count.subscriptions > 0) {
    return NextResponse.json(
      { error: "Cannot delete a plan with active subscriptions" },
      { status: 400 }
    );
  }

  await prisma.subscriptionPlan.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
