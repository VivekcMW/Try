import { NextRequest, NextResponse } from "next/server";
import { requireMerchant } from "@/lib/merchant-auth";
import { prisma } from "@/lib/prisma";
import { hasRealDatabaseConfig } from "@/lib/data-source-guard";

export async function GET(request: NextRequest) {
  if (!hasRealDatabaseConfig()) {
    return NextResponse.json({ deliveries: [], date: new Date().toISOString().split("T")[0], warning: "No live database configured" }, { status: 503 });
  }

  const { merchantId } = await requireMerchant();
  const { searchParams } = new URL(request.url);
  const today = new Date().toISOString().split("T")[0];
  const date = searchParams.get("date") ?? today;

  const deliveries = await prisma.subscriptionDelivery.findMany({
    where: {
      deliveryDate: date,
      subscription: { merchantId },
    },
    include: {
      subscription: {
        include: {
          customer: { select: { name: true, phone: true, avatarUrl: true } },
          plan: { select: { name: true, frequency: true, unit: true } },
        },
      },
    },
    orderBy: { id: "asc" },
  });
  return NextResponse.json({ deliveries, date });
}

export async function POST(request: NextRequest) {
  const { merchantId } = await requireMerchant();
  const body = await request.json();
  const { deliveryId, status } = body;

  if (!deliveryId || !["delivered", "missed"].includes(status)) {
    return NextResponse.json({ error: "deliveryId and valid status required" }, { status: 400 });
  }

  const existing = await prisma.subscriptionDelivery.findFirst({
    where: {
      id: deliveryId,
      subscription: { merchantId },
    },
  });
  if (!existing) {
    return NextResponse.json({ error: "Delivery not found" }, { status: 404 });
  }

  const delivery = await prisma.subscriptionDelivery.update({
    where: { id: deliveryId },
    data: {
      status,
      deliveredAt: status === "delivered" ? new Date() : null,
    },
  });
  return NextResponse.json({ delivery });
}
