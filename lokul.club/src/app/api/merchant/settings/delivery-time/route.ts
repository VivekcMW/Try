import { NextResponse } from "next/server";
import { requireMerchant } from "@/lib/merchant-auth";
import prisma from "@/lib/prisma";

export async function PUT(request: Request) {
  try {
    const { merchantId } = await requireMerchant();
    const { estimatedDeliveryMins } = await request.json();

    if (!estimatedDeliveryMins || typeof estimatedDeliveryMins !== 'number') {
      return NextResponse.json(
        { error: "estimatedDeliveryMins is required and must be a number" },
        { status: 400 }
      );
    }

    if (estimatedDeliveryMins < 5 || estimatedDeliveryMins > 180) {
      return NextResponse.json(
        { error: "Delivery time must be between 5 and 180 minutes" },
        { status: 400 }
      );
    }

    await prisma.merchant.update({
      where: { id: merchantId },
      data: { estimatedDeliveryMins },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error updating delivery time:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
