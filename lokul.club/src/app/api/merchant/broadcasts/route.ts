import { NextRequest, NextResponse } from "next/server";
import { requireMerchant } from "@/lib/merchant-auth";
import { prisma } from "@/lib/prisma";
import { isFeatureEnabled } from "@/lib/feature-flags-server";

export async function GET() {
  // List past broadcasts for this merchant
  const { merchantId } = await requireMerchant();
  const broadcasts = await prisma.merchantBroadcast.findMany({
    where: { merchantId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ broadcasts });
}

export async function POST(request: NextRequest) {
  try {
    const { merchantId, merchant, userId } = await requireMerchant();
    if (!(await isFeatureEnabled("merchant_broadcasts", { pinCode: merchant.pinCode, city: merchant.city, userId }))) {
      return NextResponse.json({ error: "Broadcasts are currently disabled" }, { status: 403 });
    }

    const { title, message } = await request.json();

    if (!title?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "title and message required" }, { status: 400 });
    }
    if (title.length > 100) return NextResponse.json({ error: "title max 100 chars" }, { status: 400 });
    if (message.length > 500) return NextResponse.json({ error: "message max 500 chars" }, { status: 400 });

    // Get all unique customers who ordered from this merchant
    const orderCustomers = await prisma.merchantOrder.findMany({
      where: { merchantId, status: { in: ["completed", "confirmed", "in_progress"] } },
      select: { customerId: true },
      distinct: ["customerId"],
    });

    const customerIds = orderCustomers.map((o) => o.customerId);

    // Create broadcast record
    const broadcast = await prisma.merchantBroadcast.create({
      data: { merchantId, title: title.trim(), message: message.trim(), sentTo: customerIds.length },
    });

    // Send push to all customers (fire and forget — don't block on failures)
    if (customerIds.length > 0) {
      const { sendPush } = await import("@/lib/push");
      const pushPromises = customerIds.map((userId) =>
        sendPush(
          { userId },
          { title: title.trim(), body: message.trim(), priority: "high" }
        ).catch(() => {})
      );
      // Don't await all — respond immediately, let notifications send in background
      Promise.allSettled(pushPromises).catch(() => {});
    }

    return NextResponse.json({ broadcast, sentTo: customerIds.length }, { status: 201 });
  } catch (error: any) {
    if (error?.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("Broadcast failed:", error);
    return NextResponse.json({ error: "Failed to send broadcast" }, { status: 500 });
  }
}
