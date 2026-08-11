/**
 * GET /api/merchant/customers — list unique customers with order stats for the authenticated merchant
 */
import { NextResponse } from "next/server";
import { requireMerchant } from "@/lib/merchant-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { merchantId } = await requireMerchant();

    const orders = await prisma.merchantOrder.findMany({
      where: {
        merchantId,
        status: { in: ["completed", "confirmed", "in_progress"] },
      },
      select: {
        customerId: true,
        totalPaise: true,
        createdAt: true,
        customer: {
          select: {
            name: true,
            phone: true,
            avatarUrl: true,
            kycTier: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Aggregate by customerId
    const customerMap = new Map<
      string,
      {
        id: string;
        name: string;
        phone: string | null;
        avatarUrl: string | null;
        kycTier: string;
        orderCount: number;
        totalSpentPaise: number;
        lastOrderAt: Date;
        firstOrderAt: Date;
      }
    >();

    for (const order of orders) {
      const existing = customerMap.get(order.customerId);
      if (existing) {
        existing.orderCount += 1;
        existing.totalSpentPaise += order.totalPaise;
        if (order.createdAt > existing.lastOrderAt) {
          existing.lastOrderAt = order.createdAt;
        }
        if (order.createdAt < existing.firstOrderAt) {
          existing.firstOrderAt = order.createdAt;
        }
      } else {
        customerMap.set(order.customerId, {
          id: order.customerId,
          name: order.customer.name,
          phone: order.customer.phone,
          avatarUrl: order.customer.avatarUrl,
          kycTier: order.customer.kycTier,
          orderCount: 1,
          totalSpentPaise: order.totalPaise,
          lastOrderAt: order.createdAt,
          firstOrderAt: order.createdAt,
        });
      }
    }

    // Sort by order count descending
    const customers = Array.from(customerMap.values()).sort(
      (a, b) => b.orderCount - a.orderCount
    );

    return NextResponse.json({ customers });
  } catch (error: any) {
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Failed to fetch customers:", error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}
