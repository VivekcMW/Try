import { NextRequest, NextResponse } from "next/server";
import { requireMerchant } from "@/lib/merchant-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { merchantId } = await requireMerchant();
  const plans = await prisma.subscriptionPlan.findMany({
    where: { merchantId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { subscriptions: true } },
    },
  });
  return NextResponse.json({ plans });
}

export async function POST(request: NextRequest) {
  const { merchantId } = await requireMerchant();
  const body = await request.json();
  const { name, description, pricePaise, frequency, unit } = body;

  if (!name?.trim() || !pricePaise || pricePaise <= 0) {
    return NextResponse.json({ error: "name and pricePaise required" }, { status: 400 });
  }

  const plan = await prisma.subscriptionPlan.create({
    data: {
      merchantId,
      name: name.trim(),
      description: description?.trim() || null,
      pricePaise,
      frequency: frequency ?? "daily",
      unit: unit?.trim() || null,
    },
  });
  return NextResponse.json({ plan }, { status: 201 });
}
