/**
 * GET  /api/mobile/orders          — list orders for a user (as buyer or seller)
 * POST /api/mobile/orders          — create a new order (deducts escrow from buyer wallet)
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { captureServerEvent } from "@/lib/analytics-server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const userId = searchParams.get("userId");
  const role   = searchParams.get("role") ?? "buyer"; // buyer | seller
  const limit  = Math.min(50, parseInt(searchParams.get("limit") ?? "20", 10));

  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  try {
    const orders = await prisma.order.findMany({
      where: role === "seller" ? { sellerId: userId } : { buyerId: userId },
      include: {
        buyer:   { select: { id: true, name: true, avatarUrl: true, kycTier: true, phone: true } },
        seller:  { select: { id: true, name: true, avatarUrl: true, kycTier: true, phone: true } },
        listing: { select: { id: true, category: true, title: true } },
        rating:  true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return NextResponse.json({ items: orders });
  } catch {
    return NextResponse.json({ items: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { buyerId, sellerId, listingId, serviceCategory, title, descriptionSnapshot,
            pricePaise, quantity, scheduledAt, addressNote, buyerNote, pinCode } = body;
    if (!buyerId || !sellerId || !title || pricePaise == null) {
      return NextResponse.json({ error: "buyerId, sellerId, title, pricePaise required" }, { status: 400 });
    }

    const totalPaise = pricePaise * (quantity ?? 1);

    // Check buyer has sufficient balance
    const buyer = await prisma.user.findUnique({
      where: { id: buyerId },
      select: { walletBalancePaise: true },
    });
    if (!buyer) return NextResponse.json({ error: "Buyer not found" }, { status: 404 });
    if (buyer.walletBalancePaise < totalPaise) {
      return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 422 });
    }

    // Atomically create order + hold buyer funds
    const [order] = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          buyerId, sellerId, listingId, serviceCategory,
          title, descriptionSnapshot, pricePaise, quantity: quantity ?? 1,
          scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
          addressNote, buyerNote, pinCode: pinCode ?? "",
        },
      });

      // Debit buyer balance + increment held
      await tx.user.update({
        where: { id: buyerId },
        data: {
          walletBalancePaise: { decrement: totalPaise },
          walletHeldPaise:    { increment: totalPaise },
        },
      });

      // Create hold ledger entry linked to order
      await tx.walletEntry.create({
        data: {
          userId:      buyerId,
          type:        "hold",
          amountPaise: totalPaise,
          description: `Payment held for: ${title}`,
          reference:   newOrder.id,
          status:      "pending",
          party:       sellerId,
        },
      });

      return [newOrder];
    });

    // Funnel step 3/3: onboarding → first post → first order
    captureServerEvent(buyerId, "order_created", {
      orderId: order.id,
      totalPaise,
      serviceCategory: serviceCategory ?? null,
    });

    return NextResponse.json(order, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
