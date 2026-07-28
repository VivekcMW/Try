/**
 * PUT /api/merchant/settings/business-hours
 * Update merchant business hours
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMerchant } from "@/lib/merchant-session";

export async function PUT(req: NextRequest) {
  try {
    const { merchantId } = await requireMerchant(req);
    const body = await req.json();

    const { businessHoursStart, businessHoursEnd } = body;

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (businessHoursStart && !timeRegex.test(businessHoursStart)) {
      return NextResponse.json(
        { error: "Invalid opening time format. Use HH:MM (24-hour format)" },
        { status: 400 }
      );
    }
    if (businessHoursEnd && !timeRegex.test(businessHoursEnd)) {
      return NextResponse.json(
        { error: "Invalid closing time format. Use HH:MM (24-hour format)" },
        { status: 400 }
      );
    }

    // Update merchant
    await prisma.merchant.update({
      where: { id: merchantId },
      data: {
        businessHoursStart: businessHoursStart || null,
        businessHoursEnd: businessHoursEnd || null,
      },
    });

    return NextResponse.json({
      message: "Business hours updated successfully",
    });
  } catch (error) {
    console.error("Error updating business hours:", error);
    return NextResponse.json(
      { error: "Failed to update business hours" },
      { status: 500 }
    );
  }
}
