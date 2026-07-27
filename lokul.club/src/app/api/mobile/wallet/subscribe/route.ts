/**
 * POST /api/mobile/wallet/subscribe
 * Body: { userId: string; tier: "plus" | "business"; months?: number }
 *
 * Creates a Razorpay order for a subscription purchase.
 * The mobile client uses the returned orderId with the Razorpay checkout SDK,
 * then calls /wallet/payment/verify to confirm and activate.
 *
 * Prices (in paise):
 *   plus     → ₹49 /mo  = 4900 paise
 *   business → ₹149 /mo = 14900 paise
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createRazorpayOrder, isRazorpayConfigured } from "@/lib/razorpay";

const E2E = process.env.E2E_TEST === "1" || (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");

const PRICE_PAISE: Record<string, number> = {
  plus:     4_900,  // ₹49
  business: 14_900, // ₹149
};

export async function POST(req: NextRequest) {
  try {
    const { userId, tier, months = 1 } = await req.json();

    if (!userId || !tier || !["plus", "business"].includes(tier)) {
      return NextResponse.json({ error: "userId and valid tier required" }, { status: 400 });
    }

    const amountPaise  = PRICE_PAISE[tier] * Number(months);
    const expiresAt    = new Date(
      Date.now() + Number(months) * 30 * 24 * 60 * 60 * 1000
    ).toISOString();

    // E2E / dev without Razorpay keys — return stub
    if (E2E || !isRazorpayConfigured()) {
      return NextResponse.json({
        ok:           true,
        tier,
        expiresAt,
        amountPaise,
        transactionId: `txn_dev_${Date.now()}`,
        isStub:        true,
      });
    }

    const receipt = `sub_${userId}_${tier}_${Date.now()}`.slice(0, 40);
    const rpOrder = await createRazorpayOrder({
      amountPaise,
      receipt,
      notes: { userId, purpose: tier, months: String(months), expiresAt },
    });

    await prisma.razorpayOrder.create({
      data: {
        razorpayOrderId: rpOrder.id as string,
        userId,
        amountPaise,
        purpose: tier,
        status:  "created",
      },
    });

    return NextResponse.json({
      ok:         true,
      tier,
      expiresAt,
      amountPaise,
      orderId:    rpOrder.id,
      keyId:      process.env.RAZORPAY_KEY_ID,
    });
  } catch (e) {
    console.error("[wallet/subscribe]", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
