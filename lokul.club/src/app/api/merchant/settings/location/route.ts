import { NextRequest, NextResponse } from "next/server";
import { requireMerchant } from "@/lib/merchant-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { merchantId } = await requireMerchant();
    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId },
      select: {
        addressLine1: true,
        addressLine2: true,
        serviceRadiusKm: true,
      },
    });
    return NextResponse.json(merchant ?? {});
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
    const { addressLine1, addressLine2, serviceRadiusKm } = body;

    await prisma.merchant.update({
      where: { id: merchantId },
      data: {
        addressLine1: addressLine1?.trim() || null,
        addressLine2: addressLine2?.trim() || null,
        serviceRadiusKm: serviceRadiusKm != null ? parseFloat(serviceRadiusKm) : null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.message?.includes("Unauthorized"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
