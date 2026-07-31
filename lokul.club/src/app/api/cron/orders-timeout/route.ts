import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/cron/orders-timeout
 *
 * Invoked by Vercel Cron (every hour). Finds MerchantOrders that have been
 * in "in_progress" status for more than 4 hours and auto-completes them.
 *
 * Protected by a shared secret: Authorization: Bearer <CRON_SECRET>
 */

export const maxDuration = 60;

const TIMEOUT_HOURS = 4;

export async function GET(req: NextRequest) {
  // Auth check
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - TIMEOUT_HOURS * 60 * 60 * 1000);

  // Find all orders stuck in_progress beyond the timeout threshold
  const stuckOrders = await prisma.merchantOrder.findMany({
    where: {
      status: "in_progress",
      inProgressAt: {
        not: null,
        lt: cutoff,
      },
    },
    select: {
      id: true,
      status: true,
      merchantId: true,
      merchant: {
        select: { ownerId: true },
      },
    },
  });

  const now = new Date();
  const completedIds: string[] = [];
  const errors: { orderId: string; error: string }[] = [];

  for (const order of stuckOrders) {
    try {
      await prisma.$transaction([
        prisma.merchantOrder.update({
          where: { id: order.id },
          data: {
            status: "completed",
            completedAt: now,
          },
        }),
        prisma.orderStatusHistory.create({
          data: {
            orderId: order.id,
            fromStatus: "in_progress",
            toStatus: "completed",
            changedBy: order.merchant.ownerId,
            reason: "Auto-completed after 4 hours",
          },
        }),
      ]);

      completedIds.push(order.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[cron/orders-timeout] Failed to complete order ${order.id}:`, err);
      errors.push({ orderId: order.id, error: message });
    }
  }

  console.log(
    `[cron/orders-timeout] Completed ${completedIds.length}/${stuckOrders.length} stuck orders.`,
    errors.length > 0 ? `Errors: ${errors.length}` : "",
  );

  return NextResponse.json({
    completed: completedIds.length,
    orderIds: completedIds,
    ...(errors.length > 0 && { errors }),
  });
}
