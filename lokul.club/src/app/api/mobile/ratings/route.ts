/**
 * POST /api/mobile/ratings  — submit a rating for a completed order
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { orderId, raterId, score, review } = await req.json();
    if (!orderId || !raterId || !score) {
      return NextResponse.json({ error: "orderId, raterId, score required" }, { status: 400 });
    }
    if (score < 1 || score > 5) {
      return NextResponse.json({ error: "score must be 1–5" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (order.status !== "completed") {
      return NextResponse.json({ error: "Order must be completed first" }, { status: 409 });
    }
    if (order.buyerId !== raterId) {
      return NextResponse.json({ error: "Only the buyer can rate" }, { status: 403 });
    }

    const rating = await prisma.rating.create({
      data: {
        orderId,
        raterId,
        rateeId: order.sellerId,
        listingId: order.listingId ?? undefined,
        score,
        review: review ?? null,
      },
    });

    // Recompute seller's average rating
    const agg = await prisma.rating.aggregate({
      where: { rateeId: order.sellerId },
      _avg: { score: true },
      _count: { score: true },
    });
    await prisma.user.update({
      where: { id: order.sellerId },
      data: { trustScore: Math.round((agg._avg.score ?? 0) * 20) },
    });
    if (order.listingId) {
      await prisma.serviceListing.update({
        where: { id: order.listingId },
        data: {
          ratingAvg:   agg._avg.score ?? 0,
          ratingCount: agg._count.score,
        },
      });
    }

    return NextResponse.json(rating, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
