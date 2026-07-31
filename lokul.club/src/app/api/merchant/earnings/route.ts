/**
 * GET /api/merchant/earnings — monthly and 30-day earnings summary for the authenticated merchant
 */
import { NextResponse } from "next/server";
import { requireMerchant } from "@/lib/merchant-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { merchantId } = await requireMerchant();

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const last30DaysStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Fetch all completed orders for this month and last month (covers both windows)
    const allOrders = await prisma.merchantOrder.findMany({
      where: {
        merchantId,
        status: "completed",
        createdAt: { gte: lastMonthStart },
      },
      select: {
        totalPaise: true,
        createdAt: true,
      },
    });

    // This month stats
    const thisMonthOrders = allOrders.filter((o) => o.createdAt >= thisMonthStart);
    const thisMonthRevenue = thisMonthOrders.reduce((sum, o) => sum + o.totalPaise, 0);
    const thisMonthCount = thisMonthOrders.length;

    // Last month stats
    const lastMonthOrders = allOrders.filter(
      (o) => o.createdAt >= lastMonthStart && o.createdAt < thisMonthStart
    );
    const lastMonthRevenue = lastMonthOrders.reduce((sum, o) => sum + o.totalPaise, 0);
    const lastMonthCount = lastMonthOrders.length;

    // Last 30 days: group by date string YYYY-MM-DD
    const last30Orders = allOrders.filter((o) => o.createdAt >= last30DaysStart);

    const dayMap = new Map<string, { revenuePaise: number; orders: number }>();
    // Initialise all 30 days so gaps show as zero
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      dayMap.set(key, { revenuePaise: 0, orders: 0 });
    }

    for (const order of last30Orders) {
      const key = order.createdAt.toISOString().slice(0, 10);
      const existing = dayMap.get(key);
      if (existing) {
        existing.revenuePaise += order.totalPaise;
        existing.orders += 1;
      }
    }

    const last30Days = Array.from(dayMap.entries()).map(([date, stats]) => ({
      date,
      revenuePaise: stats.revenuePaise,
      orders: stats.orders,
    }));

    // Top items: query order items for completed orders this month
    const orderItems = await prisma.merchantOrderItem.findMany({
      where: {
        order: {
          merchantId,
          status: "completed",
          createdAt: { gte: thisMonthStart },
        },
      },
      select: {
        name: true,
        quantity: true,
        totalPaise: true,
      },
    });

    const itemMap = new Map<string, { quantity: number; revenuePaise: number }>();
    for (const item of orderItems) {
      const existing = itemMap.get(item.name);
      if (existing) {
        existing.quantity += item.quantity;
        existing.revenuePaise += item.totalPaise;
      } else {
        itemMap.set(item.name, { quantity: item.quantity, revenuePaise: item.totalPaise });
      }
    }

    const topItems = Array.from(itemMap.entries())
      .map(([name, stats]) => ({ name, quantity: stats.quantity, revenuePaise: stats.revenuePaise }))
      .sort((a, b) => b.revenuePaise - a.revenuePaise)
      .slice(0, 10);

    return NextResponse.json({
      thisMonth: {
        revenuePaise: thisMonthRevenue,
        orders: thisMonthCount,
        avgOrderPaise: thisMonthCount > 0 ? Math.round(thisMonthRevenue / thisMonthCount) : 0,
      },
      lastMonth: {
        revenuePaise: lastMonthRevenue,
        orders: lastMonthCount,
      },
      last30Days,
      topItems,
    });
  } catch (error: any) {
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Failed to fetch earnings:", error);
    return NextResponse.json({ error: "Failed to fetch earnings" }, { status: 500 });
  }
}
