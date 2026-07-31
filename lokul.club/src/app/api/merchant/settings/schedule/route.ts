import { NextRequest, NextResponse } from "next/server";
import { requireMerchant } from "@/lib/merchant-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { merchantId } = await requireMerchant();
    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId },
      select: {
        closedWeekdays: true,
        paymentMethods: true,
      },
    });
    return NextResponse.json({
      closedWeekdays: (merchant?.closedWeekdays as number[]) ?? [],
      paymentMethods: (merchant?.paymentMethods as string[]) ?? [],
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
    const { closedWeekdays, paymentMethods } = body;

    const data: Record<string, unknown> = {};

    if (closedWeekdays !== undefined) {
      if (!Array.isArray(closedWeekdays) || closedWeekdays.some((d) => d < 0 || d > 6)) {
        return NextResponse.json(
          { error: "closedWeekdays must be an array of integers 0–6 (Sun=0 … Sat=6)" },
          { status: 400 }
        );
      }
      data.closedWeekdays = closedWeekdays;
    }

    if (paymentMethods !== undefined) {
      if (!Array.isArray(paymentMethods)) {
        return NextResponse.json({ error: "paymentMethods must be an array" }, { status: 400 });
      }
      data.paymentMethods = paymentMethods;
    }

    await prisma.merchant.update({
      where: { id: merchantId },
      data,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.message?.includes("Unauthorized"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
