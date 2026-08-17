/**
 * GET  /api/merchant/coupons — list all coupons for the authenticated merchant
 * POST /api/merchant/coupons — create a new coupon
 */
import { NextRequest, NextResponse } from "next/server";
import { requireMerchant } from "@/lib/merchant-auth";
import { prisma } from "@/lib/prisma";
import { isFeatureEnabled } from "@/lib/feature-flags-server";

const CODE_REGEX = /^[A-Z0-9]{3,20}$/;

export async function GET() {
  try {
    const { merchantId } = await requireMerchant();

    const coupons = await prisma.merchantCoupon.findMany({
      where: { merchantId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ coupons });
  } catch (error: any) {
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Failed to fetch coupons:", error);
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { merchantId, merchant, userId } = await requireMerchant();
    if (!(await isFeatureEnabled("merchant_coupons", { pinCode: merchant.pinCode, city: merchant.city, userId }))) {
      return NextResponse.json({ error: "Coupons are currently disabled" }, { status: 403 });
    }

    const body = await req.json();
    const {
      code,
      description,
      discountType,
      discountValue,
      minSpendRupees,
      maxUsesTotal,
      maxUsesPerUser,
      expiresAt,
    } = body;

    // Validate required fields
    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const upperCode = code.toUpperCase().trim();
    if (!CODE_REGEX.test(upperCode)) {
      return NextResponse.json(
        { error: "Code must be 3–20 alphanumeric characters (A-Z, 0-9)" },
        { status: 400 }
      );
    }

    if (!["percent_off", "flat_off"].includes(discountType)) {
      return NextResponse.json(
        { error: "discountType must be 'percent_off' or 'flat_off'" },
        { status: 400 }
      );
    }

    const discountValueNum = Number(discountValue);
    if (!discountValueNum || discountValueNum <= 0) {
      return NextResponse.json({ error: "discountValue must be greater than 0" }, { status: 400 });
    }

    if (discountType === "percent_off" && (discountValueNum <= 0 || discountValueNum >= 100)) {
      return NextResponse.json({ error: "Percent discount must be between 1 and 99" }, { status: 400 });
    }

    // Convert rupees to paise for storage
    const minSpendPaise =
      minSpendRupees != null && minSpendRupees !== ""
        ? Math.round(Number(minSpendRupees) * 100)
        : null;

    const discountValuePaise =
      discountType === "flat_off"
        ? Math.round(discountValueNum * 100)
        : discountValueNum; // percent stored as-is (integer 1-99)

    try {
      const coupon = await prisma.merchantCoupon.create({
        data: {
          merchantId,
          code: upperCode,
          description: description?.trim() || null,
          discountType,
          discountValue: discountValuePaise,
          minSpendPaise: minSpendPaise ?? null,
          maxUsesTotal: maxUsesTotal ? Number(maxUsesTotal) : null,
          maxUsesPerUser: maxUsesPerUser ? Number(maxUsesPerUser) : 1,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
        },
      });

      return NextResponse.json({ coupon }, { status: 201 });
    } catch (dbError: any) {
      // Unique constraint violation on (merchantId, code)
      if (dbError.code === "P2002") {
        return NextResponse.json(
          { error: `Coupon code "${upperCode}" already exists for your store` },
          { status: 409 }
        );
      }
      throw dbError;
    }
  } catch (error: any) {
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Failed to create coupon:", error);
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}
