/**
 * POST /api/mobile/merchant-orders/[id]/cancel — customer cancels their order
 * Body: { customerId: string, reason?: string }
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPush } from "@/lib/push";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { customerId, reason } = body;

    if (!customerId) {
      return NextResponse.json(
        { error: "customerId is required" },
        { status: 400 }
      );
    }

    // Fetch the order
    const existingOrder = await prisma.merchantOrder.findFirst({
      where: { id, customerId },
      include: {
        merchant: {
          select: { id: true, name: true, ownerId: true },
        },
      },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only allow cancellation if order is pending or confirmed
    if (!["pending", "confirmed"].includes(existingOrder.status)) {
      return NextResponse.json(
        { error: `Cannot cancel order in ${existingOrder.status} status` },
        { status: 422 }
      );
    }

    const now = new Date();

    // Cancel order in transaction
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Create status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          fromStatus: existingOrder.status,
          toStatus: "cancelled",
          changedBy: customerId,
          reason: reason || "Cancelled by customer",
        },
      });

      // Update order
      const order = await tx.merchantOrder.update({
        where: { id },
        data: {
          status: "cancelled",
          cancelledAt: now,
          cancellationReason: reason || "Cancelled by customer",
        },
        include: {
          merchant: true,
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
            take: 5,
          },
        },
      });

      // Handle refund if paid via wallet
      if (existingOrder.paymentStatus === "paid") {
        // Refund customer wallet
        await tx.user.update({
          where: { id: customerId },
          data: {
            walletBalancePaise: { increment: existingOrder.totalPaise },
          },
        });

        // Create refund wallet entry
        await tx.walletEntry.create({
          data: {
            userId: customerId,
            type: "refund",
            amountPaise: existingOrder.totalPaise,
            description: `Refund for cancelled order ${existingOrder.orderNumber}`,
            status: "completed",
            reference: existingOrder.id,
            party: existingOrder.merchant.name,
          },
        });

        // Mark merchant hold as reversed
        await tx.walletEntry.updateMany({
          where: {
            userId: existingOrder.merchant.ownerId,
            reference: existingOrder.id,
            type: "hold",
            status: "pending",
          },
          data: { status: "reversed" },
        });

        // Update payment status
        await tx.merchantOrder.update({
          where: { id: existingOrder.id },
          data: { paymentStatus: "refunded" },
        });
      }

      return order;
    });

    // Send push notification to merchant
    await sendPush(
      { userId: existingOrder.merchant.ownerId },
      {
        title: "Order Cancelled",
        body: `Order ${existingOrder.orderNumber} was cancelled by the customer`,
        data: { type: "merchant_order_cancelled", orderId: existingOrder.id },
        priority: "high",
      }
    );

    return NextResponse.json({ order: updatedOrder });
  } catch (error: any) {
    console.error("Failed to cancel order:", error);
    return NextResponse.json(
      { error: "Failed to cancel order", details: error.message },
      { status: 500 }
    );
  }
}
