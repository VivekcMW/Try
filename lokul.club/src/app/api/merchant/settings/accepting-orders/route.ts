/**
 * PUT /api/merchant/settings/accepting-orders — toggle accepting orders status
 * Body: { acceptingOrders: boolean, closedReason?: string, closedUntil?: string }
 */
import { NextRequest, NextResponse } from "next/server";
import { requireMerchant } from "@/lib/merchant-auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  try {
    const { merchant } = await requireMerchant();
    const body = await req.json();

    const { acceptingOrders, closedReason, closedUntil } = body as {
      acceptingOrders: boolean;
      closedReason?: string;
      closedUntil?: string;
    };

    if (typeof acceptingOrders !== "boolean") {
      return NextResponse.json(
        { error: "acceptingOrders must be a boolean" },
        { status: 400 }
      );
    }

    // Validate closedUntil is in the future if provided
    if (closedUntil) {
      const reopenDate = new Date(closedUntil);
      if (reopenDate <= new Date()) {
        return NextResponse.json(
          { error: "closedUntil must be in the future" },
          { status: 400 }
        );
      }
    }

    // Update merchant settings
    const updatedMerchant = await prisma.merchant.update({
      where: { id: merchant.id },
      data: {
        acceptingOrders,
        closedReason: acceptingOrders ? null : closedReason || null,
        closedUntil: acceptingOrders
          ? null
          : closedUntil
          ? new Date(closedUntil)
          : null,
      },
      select: {
        id: true,
        acceptingOrders: true,
        closedReason: true,
        closedUntil: true,
      },
    });

    return NextResponse.json({
      success: true,
      merchant: updatedMerchant,
      message: acceptingOrders
        ? "Your business is now accepting orders"
        : "Your business is paused. Customers cannot place new orders",
    });
  } catch (err: any) {
    console.error("Failed to update accepting orders status:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/merchant/settings/accepting-orders — get current accepting orders status
 */
export async function GET(req: NextRequest) {
  try {
    const { merchant } = await requireMerchant();

    const merchantData = await prisma.merchant.findUnique({
      where: { id: merchant.id },
      select: {
        acceptingOrders: true,
        closedReason: true,
        closedUntil: true,
      },
    });

    if (!merchantData) {
      return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
    }

    return NextResponse.json(merchantData);
  } catch (err: any) {
    console.error("Failed to fetch accepting orders status:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch settings" },
      { status: 500 }
    );
  }
}
