/**
 * GET  /api/merchant/orders/stats — order statistics for merchant dashboard
 */
import { NextRequest, NextResponse } from "next/server";
import { requireMerchant } from "@/lib/merchant-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { merchant } = await requireMerchant();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get stats in parallel
    const [
      todayOrders,
      pendingOrders,
      inProgressOrders,
      todayRevenue,
      weeklyOrders,
      monthlyRevenue,
      completionRate,
    ] = await Promise.all([
      // Today's orders count
      prisma.merchantOrder.count({
        where: {
          merchantId: merchant.id,
          createdAt: { gte: today, lt: tomorrow },
        },
      }),
      
      // Pending orders count
      prisma.merchantOrder.count({
        where: {
          merchantId: merchant.id,
          status: "pending",
        },
      }),
      
      // In progress orders count
      prisma.merchantOrder.count({
        where: {
          merchantId: merchant.id,
          status: "in_progress",
        },
      }),
      
      // Today's revenue (completed orders)
      prisma.merchantOrder.aggregate({
        where: {
          merchantId: merchant.id,
          status: "completed",
          completedAt: { gte: today, lt: tomorrow },
        },
        _sum: { totalPaise: true },
      }),
      
      // Last 7 days orders
      prisma.merchantOrder.count({
        where: {
          merchantId: merchant.id,
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
      
      // This month revenue
      prisma.merchantOrder.aggregate({
        where: {
          merchantId: merchant.id,
          status: "completed",
          completedAt: {
            gte: new Date(today.getFullYear(), today.getMonth(), 1),
          },
        },
        _sum: { totalPaise: true },
      }),
      
      // Completion rate (last 30 days)
      prisma.merchantOrder.groupBy({
        by: ["status"],
        where: {
          merchantId: merchant.id,
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
        _count: true,
      }),
    ]);

    // Calculate completion rate
    const totalLast30 = completionRate.reduce((sum, group) => sum + group._count, 0);
    const completedLast30 = completionRate.find((g) => g.status === "completed")?._count || 0;
    const completionRatePercent = totalLast30 > 0 ? Math.round((completedLast30 / totalLast30) * 100) : 0;

    return NextResponse.json({
      today: {
        orders: todayOrders,
        revenuePaise: todayRevenue._sum.totalPaise || 0,
      },
      pending: pendingOrders,
      inProgress: inProgressOrders,
      weekly: {
        orders: weeklyOrders,
      },
      monthly: {
        revenuePaise: monthlyRevenue._sum.totalPaise || 0,
      },
      completionRate: completionRatePercent,
    });
  } catch (error: any) {
    if (error.message === "Not authenticated" || error.message?.includes("suspended")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Failed to fetch order stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
