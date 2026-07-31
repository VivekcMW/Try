import { NextRequest, NextResponse } from "next/server";
import { requireMerchant } from "@/lib/merchant-auth";
import { prisma } from "@/lib/prisma";

const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export async function GET() {
  try {
    const { merchantId } = await requireMerchant();
    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId },
      select: {
        gstNumber: true,
        fssaiNumber: true,
        businessLicense: true,
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
    const { gstNumber, fssaiNumber, businessLicense } = body;

    let gstWarning: string | undefined;
    const trimmedGst = gstNumber?.trim() || null;
    if (trimmedGst && !GST_REGEX.test(trimmedGst)) {
      gstWarning = "GST number format looks incorrect — saved anyway, please verify.";
    }

    await prisma.merchant.update({
      where: { id: merchantId },
      data: {
        gstNumber: trimmedGst,
        fssaiNumber: fssaiNumber?.trim() || null,
        businessLicense: businessLicense?.trim() || null,
      },
    });

    return NextResponse.json({ success: true, ...(gstWarning ? { warning: gstWarning } : {}) });
  } catch (error: any) {
    if (error?.message?.includes("Unauthorized"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
