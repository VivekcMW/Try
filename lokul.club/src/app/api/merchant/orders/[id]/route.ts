/**
 * GET   /api/merchant/orders/[id] — get order details
 * PATCH /api/merchant/orders/[id] — update order (notes, estimated time)
 */
import { NextRequest, NextResponse } from "next/server";
import { requireMerchant } from "@/lib/merchant-auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { merchant } = await requireMerchant();
    const { id } = await params;

    const order = await prisma.merchantOrder.findFirst({
      where: {
        id,
        merchantId: merchant.id,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            avatarUrl: true,
            kycTier: true,
          },
        },
        orderItems: {
          include: {
            catalogItem: {
              select: { id: true, name: true, imageUrl: true },
            },
          },
        },
        statusHistory: {
          orderBy: { createdAt: "desc" },
        },
        rating: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    if (error.message === "Not authenticated" || error.message?.includes("suspended")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Failed to fetch order:", error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { merchant } = await requireMerchant();
    const { id } = await params;
    const body = await req.json();
    
    const { merchantNotes, estimatedReadyAt } = body;

    // Verify order belongs to merchant
    const existingOrder = await prisma.merchantOrder.findFirst({
      where: { id, merchantId: merchant.id },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update order
    const updatedOrder = await prisma.merchantOrder.update({
      where: { id },
      data: {
        ...(merchantNotes !== undefined && { merchantNotes }),
        ...(estimatedReadyAt && { estimatedReadyAt: new Date(estimatedReadyAt) }),
      },
      include: {
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
      },
    });

    return NextResponse.json({ order: updatedOrder });
  } catch (error: any) {
    if (error.message === "Not authenticated" || error.message?.includes("suspended")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Failed to update order:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
