/**
 * GET  /api/mobile/subscriptions  — list subscriptions for a user (?userId=...)
 * POST /api/mobile/subscriptions  — subscribe customer to a plan
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasRealDatabaseConfig, isE2eMode } from "@/lib/data-source-guard";
import { isFeatureEnabled } from "@/lib/feature-flags-server";

const E2E = isE2eMode();

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  if (E2E) return NextResponse.json({ subscriptions: [] });
  if (!hasRealDatabaseConfig()) {
    return NextResponse.json({ subscriptions: [], warning: "No live database configured" }, { status: 503 });
  }

  try {
    const subscriptions = await prisma.subscription.findMany({
      where: { customerId: userId, status: { in: ["active", "paused"] } },
      orderBy: { createdAt: "desc" },
      include: {
        plan: { select: { id: true, name: true, frequency: true, unit: true, pricePaise: true } },
        merchant: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    return NextResponse.json({ subscriptions });
  } catch {
    return NextResponse.json({ subscriptions: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, planId, quantity = 1 } = body;

    if (!(await isFeatureEnabled("merchant_subscriptions", { userId }))) {
      return NextResponse.json({ error: "Subscriptions are currently unavailable" }, { status: 403 });
    }

    if (!userId || !planId) {
      return NextResponse.json({ error: "userId and planId required" }, { status: 400 });
    }

    if (E2E) {
      return NextResponse.json({
        subscription: { id: "e2e-sub-" + Date.now(), planId, customerId: userId, status: "active" },
      }, { status: 201 });
    }

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
      select: { id: true, merchantId: true, frequency: true, isActive: true },
    });

    if (!plan || !plan.isActive) {
      return NextResponse.json({ error: "Plan not found or inactive" }, { status: 404 });
    }

    // Check no duplicate active subscription for same plan
    const existing = await prisma.subscription.findFirst({
      where: { customerId: userId, planId, status: { in: ["active", "paused"] } },
    });
    if (existing) {
      return NextResponse.json({ error: "Already subscribed to this plan" }, { status: 409 });
    }

    const startDate = new Date();

    const subscription = await prisma.subscription.create({
      data: {
        planId,
        merchantId: plan.merchantId,
        customerId: userId,
        quantity: Math.max(1, quantity),
        status: "active",
        startDate,
      },
    });

    // Auto-generate deliveries for next 30 days based on frequency
    const deliveries = generateDeliveryDates(startDate, plan.frequency, 30);
    if (deliveries.length > 0) {
      await prisma.subscriptionDelivery.createMany({
        data: deliveries.map((date) => ({
          subscriptionId: subscription.id,
          deliveryDate: date,
          status: "pending",
        })),
      });
    }

    return NextResponse.json({ subscription }, { status: 201 });
  } catch (error: any) {
    console.error("Subscription create failed:", error);
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
  }
}

function generateDeliveryDates(startDate: Date, frequency: string, days: number): string[] {
  const dates: string[] = [];
  const cursor = new Date(startDate);
  cursor.setHours(0, 0, 0, 0);

  for (let i = 0; i < days; i++) {
    const dayOfWeek = cursor.getDay(); // 0=Sun, 6=Sat

    const include =
      frequency === "daily" ||
      (frequency === "weekdays" && dayOfWeek >= 1 && dayOfWeek <= 5) ||
      (frequency === "alternate" && i % 2 === 0) ||
      (frequency === "weekly" && cursor.getDay() === startDate.getDay() && i > 0);

    if (include || (frequency === "daily" && i === 0)) {
      dates.push(toDateString(cursor));
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
