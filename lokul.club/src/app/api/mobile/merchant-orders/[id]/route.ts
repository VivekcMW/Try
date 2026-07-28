/**
 * GET /api/mobile/merchant-orders/[id] — get merchant order details
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await prisma.merchantOrder.findUnique({
      where: { id },
      include: {
        merchant: {
          select: {
            id: true,
            name: true,
            category: true,
            avatarUrl: true,
            owner: {
              select: {
                id: true,
                phone: true,
              },
            },
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            avatarUrl: true,
            kycTier: true,
          },
        },
        orderItems: true,
        statusHistory: {
          orderBy: { createdAt: "desc" },
        },
        rating: {
          select: {
            id: true,
            rating: true,
            review: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    console.error("Error fetching merchant order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order", details: error.message },
      { status: 500 }
    );
  }
}
