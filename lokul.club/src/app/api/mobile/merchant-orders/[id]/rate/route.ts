/**
 * POST /api/mobile/merchant-orders/[id]/rate — customer rates a completed order
 * Body: { customerId: string, score: 1-5, review?: string }
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const body = await req.json();
    const { customerId, score, review } = body;

    // Validate inputs
    if (!customerId || !score) {
      return NextResponse.json(
        { error: "customerId and score are required" },
        { status: 400 }
      );
    }

    if (score < 1 || score > 5) {
      return NextResponse.json(
        { error: "score must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Fetch the order
    const order = await prisma.merchantOrder.findFirst({
      where: { id: orderId, customerId },
      include: { merchant: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only allow rating completed orders
    if (order.status !== "completed") {
      return NextResponse.json(
        { error: "Only completed orders can be rated" },
        { status: 422 }
      );
    }

    // Check if already rated
    const existingRating = await prisma.orderRating.findUnique({
      where: { orderId },
    });

    if (existingRating) {
      return NextResponse.json(
        { error: "Order has already been rated" },
        { status: 409 }
      );
    }

    // Create rating in transaction
    const rating = await prisma.$transaction(async (tx) => {
      // Create rating
      const newRating = await tx.orderRating.create({
        data: {
          orderId,
          customerId,
          merchantId: order.merchantId,
          score,
          review: review || null,
        },
      });

      // Recalculate merchant's average rating
      const agg = await tx.orderRating.aggregate({
        where: { merchantId: order.merchantId },
        _avg: { score: true },
        _count: { score: true },
      });

      // Update merchant rating
      await tx.merchant.update({
        where: { id: order.merchantId },
        data: {
          ratingAvg: agg._avg.score || 0,
          ratingCount: agg._count.score,
        },
      });

      return newRating;
    });

    return NextResponse.json({ rating }, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create rating:", error);
    return NextResponse.json(
      { error: "Failed to create rating", details: error.message },
      { status: 500 }
    );
  }
}
