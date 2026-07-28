/**
 * POST /api/merchant/orders/[id]/status — update order status
 * Body: { action: "confirm" | "reject" | "start" | "complete" | "cancel", reason?: string }
 */
import { NextRequest, NextResponse } from "next/server";
import { requireMerchant } from "@/lib/merchant-auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@/generated/prisma";

type StatusAction = "confirm" | "reject" | "start" | "complete" | "cancel";

const ACTION_TO_STATUS: Record<StatusAction, OrderStatus> = {
  confirm: "confirmed",
  reject: "cancelled",
  start: "in_progress",
  complete: "completed",
  cancel: "cancelled",
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { merchant, userId } = await requireMerchant();
    const { id } = await params;
    const body = await req.json();
    
    const { action, reason } = body as { action: StatusAction; reason?: string };

    if (!action || !ACTION_TO_STATUS[action]) {
      return NextResponse.json(
        { error: "Invalid action. Must be: confirm, reject, start, complete, or cancel" },
        { status: 400 }
      );
    }

    // Verify order belongs to merchant
    const existingOrder = await prisma.merchantOrder.findFirst({
      where: { id, merchantId: merchant.id },
      include: { customer: true },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const newStatus = ACTION_TO_STATUS[action];
    const now = new Date();

    // Validate status transitions
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["in_progress", "cancelled"],
      in_progress: ["completed", "cancelled"],
      completed: [],
      cancelled: [],
      disputed: ["completed", "cancelled"],
    };

    if (!validTransitions[existingOrder.status]?.includes(newStatus)) {
      return NextResponse.json(
        { error: `Cannot transition from ${existingOrder.status} to ${newStatus}` },
        { status: 422 }
      );
    }

    // Update order in transaction
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Create status history record
      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          fromStatus: existingOrder.status,
          toStatus: newStatus,
          changedBy: userId,
          reason: reason || null,
        },
      });

      // Update order
      const updateData: any = {
        status: newStatus,
        ...(action === "confirm" && { confirmedAt: now }),
        ...(action === "start" && { inProgressAt: now }),
        ...(action === "complete" && { completedAt: now }),
        ...(action === "reject" && {
          cancelledAt: now,
          rejectionReason: reason,
        }),
        ...(action === "cancel" && {
          cancelledAt: now,
          cancellationReason: reason,
        }),
      };

      const order = await tx.merchantOrder.update({
        where: { id },
        data: updateData,
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
          statusHistory: {
            orderBy: { createdAt: "desc" },
            take: 5,
          },
        },
      });

      // Handle payment/escrow based on action
      if (action === "complete" && existingOrder.paymentStatus === "paid") {
        // Release funds from escrow to merchant (if applicable)
        // This would integrate with wallet system
        // TODO: Implement wallet integration
      }

      if ((action === "reject" || action === "cancel") && existingOrder.paymentStatus === "paid") {
        // Refund customer (if paid)
        // TODO: Implement refund logic
      }

      return order;
    });

    return NextResponse.json({ order: updatedOrder });
  } catch (error: any) {
    if (error.message === "Not authenticated" || error.message?.includes("suspended")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Failed to update order status:", error);
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
  }
}
