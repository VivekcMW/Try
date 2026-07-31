import { NextRequest, NextResponse } from "next/server";
import { requireMerchant } from "@/lib/merchant-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { merchantId } = await requireMerchant();
    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId },
      select: {
        minimumOrderPaise: true,
        freeDeliveryAbovePaise: true,
      },
    });
    return NextResponse.json({
      minimumOrderRupees:
        merchant?.minimumOrderPaise != null ? merchant.minimumOrderPaise / 100 : null,
      freeDeliveryAboveRupees:
        merchant?.freeDeliveryAbovePaise != null ? merchant.freeDeliveryAbovePaise / 100 : null,
    });
  } catch (error: any) {
    if (error?.message?.includes("Unauthorized"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { merchantId } = await requireMerchant();
    const body = await request.json();
    const { minimumOrderRupees, freeDeliveryAboveRupees } = body;

    const minimumOrderPaise =
      minimumOrderRupees != null && minimumOrderRupees > 0
        ? Math.round(Number(minimumOrderRupees) * 100)
        : null;

    const freeDeliveryAbovePaise =
      freeDeliveryAboveRupees != null && freeDeliveryAboveRupees > 0
        ? Math.round(Number(freeDeliveryAboveRupees) * 100)
        : null;

    await prisma.merchant.update({
      where: { id: merchantId },
      data: {
        minimumOrderPaise,
        freeDeliveryAbovePaise,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.message?.includes("Unauthorized"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
