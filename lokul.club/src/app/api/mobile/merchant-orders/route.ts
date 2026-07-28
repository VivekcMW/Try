/**
 * GET /api/mobile/merchant-orders?customerId=xxx — list customer's merchant orders
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json({ error: "customerId required" }, { status: 400 });
    }

    const orders = await prisma.merchantOrder.findMany({
      where: { customerId },
      include: {
        merchant: {
          select: {
            id: true,
            name: true,
            category: true,
            avatarUrl: true,
          },
        },
        orderItems: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error("Error fetching customer merchant orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders", details: error.message },
      { status: 500 }
    );
  }
}
