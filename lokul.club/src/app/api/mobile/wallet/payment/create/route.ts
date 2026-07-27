/**
 * POST /api/mobile/wallet/payment/create
 * Body: { userId: string; amountPaise: number; purpose: "wallet_topup" | "plus" | "business" }
 *
 * Creates a Razorpay order and records it in DB.
 * The mobile client passes the returned orderId to the Razorpay checkout SDK.
 * On payment success the client calls /payment/verify to confirm and credit wallet.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createRazorpayOrder,
  isRazorpayConfigured,
} from "@/lib/razorpay";

const E2E = process.env.E2E_TEST === "1" || (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");

export async function POST(req: NextRequest) {
  try {
    const { userId, amountPaise, purpose } = await req.json();

    if (!userId || !amountPaise || amountPaise <= 0 || !purpose) {
      return NextResponse.json(
        { error: "userId, amountPaise (> 0) and purpose required" },
        { status: 400 }
      );
    }

    const VALID_PURPOSES = ["wallet_topup", "plus", "business"];
    if (!VALID_PURPOSES.includes(purpose)) {
      return NextResponse.json({ error: "Invalid purpose" }, { status: 400 });
    }

    // E2E / dev with no Razorpay keys — return a stub order
    if (E2E || !isRazorpayConfigured()) {
      const stubOrderId = `order_dev_${Date.now()}`;
      return NextResponse.json({
        orderId:    stubOrderId,
        amountPaise,
        currency:   "INR",
        keyId:      process.env.RAZORPAY_KEY_ID ?? "rzp_test_dev",
        isStub:     true,
      });
    }

    const receipt  = `${purpose}_${userId}_${Date.now()}`.slice(0, 40);
    const rpOrder  = await createRazorpayOrder({
      amountPaise,
      receipt,
      notes: { userId, purpose },
    });

    // Persist in DB so the webhook / verify endpoint can cross-check
    await prisma.razorpayOrder.create({
      data: {
        razorpayOrderId: rpOrder.id as string,
        userId,
        amountPaise,
        purpose,
        status: "created",
      },
    });

    return NextResponse.json({
      orderId:    rpOrder.id,
      amountPaise,
      currency:   rpOrder.currency,
      keyId:      process.env.RAZORPAY_KEY_ID,
    });
  } catch (e) {
    console.error("[wallet/payment/create]", e);
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 });
  }
}
