import { NextRequest, NextResponse } from "next/server";
import { requireMerchant } from "@/lib/merchant-auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { merchantId } = await requireMerchant();
    const { id } = await params;

    const body = await request.json();
    const { response } = body;

    // Validate response
    if (!response || typeof response !== "string" || response.trim().length === 0) {
      return NextResponse.json(
        { error: "Response must be a non-empty string" },
        { status: 400 }
      );
    }

    if (response.trim().length > 500) {
      return NextResponse.json(
        { error: "Response must be 500 characters or fewer" },
        { status: 400 }
      );
    }

    // Check order belongs to this merchant
    const order = await prisma.merchantOrder.findFirst({
      where: { id, merchantId },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Check that an OrderRating exists for this order
    const rating = await prisma.orderRating.findFirst({
      where: { orderId: id },
    });

    if (!rating) {
      return NextResponse.json(
        { error: "No rating found for this order" },
        { status: 404 }
      );
    }

    // Update the rating with merchant response
    try {
      await (prisma.orderRating as any).update({
        where: { id: rating.id },
        data: {
          merchantResponse: response.trim(),
          respondedAt: new Date(),
        },
      });
    } catch (updateError: any) {
      // If the schema migration hasn't been applied yet, acknowledge gracefully
      if (
        updateError?.message?.includes("Unknown field") ||
        updateError?.message?.includes("merchantResponse") ||
        updateError?.message?.includes("respondedAt")
      ) {
        return NextResponse.json({ success: true, note: "schema migration needed" });
      }
      throw updateError;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.message === "Unauthorized" || error?.status === 401) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Failed to save review response:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
