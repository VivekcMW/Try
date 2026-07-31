/**
 * GET /api/cron/subscription-deliveries
 * Generates tomorrow's SubscriptionDelivery records for all active subscriptions.
 * Run daily at midnight via Vercel cron.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret") ?? req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const tomorrowStr = toDateString(tomorrow);
  const tomorrowDow = tomorrow.getDay();

  const activeSubscriptions = await prisma.subscription.findMany({
    where: { status: "active" },
    select: {
      id: true,
      planId: true,
      startDate: true,
      plan: { select: { frequency: true } },
    },
  });

  let created = 0;
  const creates: Array<{ subscriptionId: string; deliveryDate: string; status: string }> = [];

  for (const sub of activeSubscriptions) {
    const freq = sub.plan.frequency;
    const startDow = sub.startDate.getDay();

    const shouldDeliver =
      freq === "daily" ||
      (freq === "weekdays" && tomorrowDow >= 1 && tomorrowDow <= 5) ||
      (freq === "alternate" && isAlternateDay(sub.startDate, tomorrow)) ||
      (freq === "weekly" && tomorrowDow === startDow);

    if (!shouldDeliver) continue;

    // Only create if not already exists
    const exists = await prisma.subscriptionDelivery.findFirst({
      where: { subscriptionId: sub.id, deliveryDate: tomorrowStr },
      select: { id: true },
    });

    if (!exists) {
      creates.push({ subscriptionId: sub.id, deliveryDate: tomorrowStr, status: "pending" });
      created++;
    }
  }

  if (creates.length > 0) {
    await prisma.subscriptionDelivery.createMany({ data: creates });
  }

  return NextResponse.json({ created, date: tomorrowStr });
}

function isAlternateDay(startDate: Date, target: Date): boolean {
  const diffMs = target.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays % 2 === 0;
}

function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
