import { NextRequest, NextResponse } from "next/server";
import { requireMerchant } from "@/lib/merchant-auth";
import { prisma } from "@/lib/prisma";
import { hasRealDatabaseConfig } from "@/lib/data-source-guard";

export async function GET(request: NextRequest) {
  if (!hasRealDatabaseConfig()) {
    return NextResponse.json({ subscriptions: [], warning: "No live database configured" }, { status: 503 });
  }

  const { merchantId } = await requireMerchant();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? "active";

  const where =
    status === "all"
      ? { merchantId }
      : { merchantId, status };

  const subscriptions = await prisma.subscription.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      plan: { select: { name: true, frequency: true, pricePaise: true, unit: true } },
      customer: { select: { name: true, phone: true, avatarUrl: true } },
    },
  });
  return NextResponse.json({ subscriptions });
}
