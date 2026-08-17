/**
 * GET /api/mobile/merchants/[id]/plans
 * List active subscription plans for a merchant (customer-facing)
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasRealDatabaseConfig, isE2eMode } from "@/lib/data-source-guard";

const E2E = isE2eMode();

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (E2E) {
    return NextResponse.json({
      plans: [
        {
          id: "e2e-plan-1",
          name: "Daily Milk 500ml",
          description: "Fresh cow milk delivered every morning",
          pricePaise: 3500,
          frequency: "daily",
          unit: "500ml",
          isActive: true,
          merchantId: "e2e-merchant",
        },
      ],
    });
  }
  if (!hasRealDatabaseConfig()) {
    return NextResponse.json({ plans: [], warning: "No live database configured" }, { status: 503 });
  }

  const { id: merchantId } = await params;

  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { merchantId, isActive: true },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ plans });
  } catch {
    return NextResponse.json({ plans: [] });
  }
}
