import { NextRequest, NextResponse } from "next/server";
import { requireMerchant } from "@/lib/merchant-auth";
import { prisma } from "@/lib/prisma";
import { isFeatureEnabled } from "@/lib/feature-flags-server";

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
  const { merchantId, merchant, userId } = await requireMerchant();
  if (!(await isFeatureEnabled("merchant_subscriptions", { pinCode: merchant.pinCode, city: merchant.city, userId }))) {
    return NextResponse.json({ error: "Subscription plans are currently disabled" }, { status: 403 });
  }

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
