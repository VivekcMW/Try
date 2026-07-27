/**
 * GET   /api/mobile/orders/[id]  — get single order
 * PATCH /api/mobile/orders/[id]  — update order status (handles escrow release/refund)
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        buyer:   { select: { id: true, name: true, avatarUrl: true, kycTier: true, phone: true } },
        seller:  { select: { id: true, name: true, avatarUrl: true, kycTier: true, phone: true } },
        listing: true,
        rating:  true,
      },
    });
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { status, sellerNote, cancelReason, requesterId } = body;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Basic auth guard — only buyer or seller can update
    if (requesterId && requesterId !== order.buyerId && requesterId !== order.sellerId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = new Date();

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.order.update({
        where: { id },
        data: {
          ...(status && { status }),
          ...(sellerNote && { sellerNote }),
          ...(cancelReason && { cancelReason }),
          ...(status === "completed" ? { completedAt: now } : {}),
          ...(status === "cancelled" ? { cancelledAt: now } : {}),
        },
      });

      const totalPaise = order.pricePaise * order.quantity;

      if (status === "completed") {
        // Release escrow → credit seller, mark buyer hold as completed
        await tx.user.update({
          where: { id: order.sellerId },
          data: {
            walletBalancePaise:  { increment: totalPaise },
            walletEarningsPaise: { increment: totalPaise },
          },
        });

        await tx.walletEntry.create({
          data: {
            userId:      order.sellerId,
            type:        "earn",
            amountPaise: totalPaise,
            description: `Earnings: ${order.title}`,
            reference:   order.id,
            status:      "completed",
            party:       order.buyerId,
          },
        });

        // Close buyer's hold entry
        await tx.walletEntry.updateMany({
          where: { reference: order.id, type: "hold", status: "pending" },
          data:  { status: "completed" },
        });

        // Decrement buyer's heldPaise
        await tx.user.update({
          where: { id: order.buyerId },
          data: { walletHeldPaise: { decrement: totalPaise } },
        });

        // Create buyer spend entry
        await tx.walletEntry.create({
          data: {
            userId:      order.buyerId,
            type:        "spend",
            amountPaise: totalPaise,
            description: `Payment for: ${order.title}`,
            reference:   order.id,
            status:      "completed",
            party:       order.sellerId,
          },
        });

        // Update service listing stats if linked
        if (order.listingId) {
          const ratings = await tx.rating.aggregate({
            where:   { listingId: order.listingId },
            _avg:    { score: true },
            _count:  { score: true },
          });
          await tx.serviceListing.update({
            where: { id: order.listingId },
            data:  {
              ratingAvg:   ratings._avg.score ?? undefined,
              ratingCount: ratings._count.score,
            },
          });
        }
      }

      if (status === "cancelled") {
        // Refund buyer: restore balance, decrement held
        await tx.user.update({
          where: { id: order.buyerId },
          data: {
            walletBalancePaise: { increment: totalPaise },
            walletHeldPaise:    { decrement: totalPaise },
          },
        });

        await tx.walletEntry.create({
          data: {
            userId:      order.buyerId,
            type:        "refund",
            amountPaise: totalPaise,
            description: `Refund: ${order.title}`,
            reference:   order.id,
            status:      "completed",
            party:       order.sellerId,
          },
        });

        // Close buyer's hold entry
        await tx.walletEntry.updateMany({
          where: { reference: order.id, type: "hold", status: "pending" },
          data:  { status: "reversed" },
        });
      }

      return result;
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
