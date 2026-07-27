/**
 * GET  /api/mobile/delivery/orders?ownerId= — a resident's delivery orders
 * POST /api/mobile/delivery/orders — place an order (debits the wallet atomically)
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const ownerId = req.nextUrl.searchParams.get("ownerId");
  if (!ownerId) return NextResponse.json({ error: "ownerId required" }, { status: 400 });

  try {
    const orders = await prisma.deliveryOrder.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { ownerId, storeId, storeName, items, totalPaise, estimatedTime, deliveryPartner, pinCode } = await req.json();

    if (!ownerId || !storeName || !items || !totalPaise || totalPaise <= 0 || !pinCode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: ownerId }, select: { walletBalancePaise: true } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (user.walletBalancePaise < totalPaise) {
      return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 422 });
    }

    const order = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: ownerId },
        data: { walletBalancePaise: { decrement: totalPaise } },
      });
      await tx.walletEntry.create({
        data: {
          userId: ownerId,
          type: "spend",
          amountPaise: -totalPaise,
          description: `Order: ${storeName}`,
          status: "completed",
        },
      });
      return tx.deliveryOrder.create({
        data: {
          ownerId,
          storeId: storeId || null,
          storeName,
          items,
          totalPaise,
          estimatedTime: estimatedTime || "20-30 min",
          deliveryPartner: deliveryPartner || null,
          pinCode,
        },
      });
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to place order" }, { status: 400 });
  }
}
