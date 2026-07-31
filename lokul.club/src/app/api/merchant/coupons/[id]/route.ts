/**
 * PATCH  /api/merchant/coupons/[id] — update coupon (toggle isActive, edit fields)
 * DELETE /api/merchant/coupons/[id] — delete coupon
 */
import { NextRequest, NextResponse } from "next/server";
import { requireMerchant } from "@/lib/merchant-auth";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { merchantId } = await requireMerchant();
    const { id } = await params;

    // Verify coupon belongs to this merchant
    const existing = await prisma.merchantCoupon.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }
    if (existing.merchantId !== merchantId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      isActive,
      description,
      discountType,
      discountValue,
      minSpendRupees,
      maxUsesTotal,
      maxUsesPerUser,
      expiresAt,
    } = body;

    // Build update data — only include fields that were provided
    const data: Record<string, unknown> = {};

    if (isActive !== undefined) {
      data.isActive = Boolean(isActive);
    }
    if (description !== undefined) {
      data.description = description?.trim() || null;
    }
    if (discountType !== undefined) {
      if (!["percent_off", "flat_off"].includes(discountType)) {
        return NextResponse.json(
          { error: "discountType must be 'percent_off' or 'flat_off'" },
          { status: 400 }
        );
      }
      data.discountType = discountType;
    }
    if (discountValue !== undefined) {
      const dv = Number(discountValue);
      if (!dv || dv <= 0) {
        return NextResponse.json({ error: "discountValue must be greater than 0" }, { status: 400 });
      }
      const resolvedType = (discountType ?? existing.discountType) as string;
      data.discountValue = resolvedType === "flat_off" ? Math.round(dv * 100) : dv;
    }
    if (minSpendRupees !== undefined) {
      data.minSpendPaise =
        minSpendRupees != null && minSpendRupees !== ""
          ? Math.round(Number(minSpendRupees) * 100)
          : null;
    }
    if (maxUsesTotal !== undefined) {
      data.maxUsesTotal = maxUsesTotal ? Number(maxUsesTotal) : null;
    }
    if (maxUsesPerUser !== undefined) {
      data.maxUsesPerUser = Number(maxUsesPerUser) || 1;
    }
    if (expiresAt !== undefined) {
      data.expiresAt = expiresAt ? new Date(expiresAt) : null;
    }

    const coupon = await prisma.merchantCoupon.update({ where: { id }, data });
    return NextResponse.json({ coupon });
  } catch (error: any) {
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Failed to update coupon:", error);
    return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { merchantId } = await requireMerchant();
    const { id } = await params;

    // Verify coupon belongs to this merchant
    const existing = await prisma.merchantCoupon.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }
    if (existing.merchantId !== merchantId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.merchantCoupon.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Failed to delete coupon:", error);
    return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 });
  }
}
