/**
 * POST /api/mobile/wallet/payment/verify
 * Body: {
 *   razorpayOrderId: string;
 *   razorpayPaymentId: string;
 *   razorpaySignature: string;
 * }
 *
 * 1. Verifies the HMAC-SHA256 signature from the Razorpay checkout SDK.
 * 2. Credits the user's wallet balance.
 * 3. Updates the RazorpayOrder record to "paid".
 *
 * This is the client-side verification path.
 * Razorpay also sends webhooks (see /api/mobile/wallet/webhook) as the
 * authoritative server-to-server confirmation.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPaymentSignature, isRazorpayConfigured } from "@/lib/razorpay";

const E2E = process.env.E2E_TEST === "1" || (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");

export async function POST(req: NextRequest) {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } =
      await req.json();

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { error: "razorpayOrderId, razorpayPaymentId, razorpaySignature required" },
        { status: 400 }
      );
    }

    // E2E / stub path
    if (E2E || !isRazorpayConfigured()) {
      return NextResponse.json({ ok: true, newBalancePaise: 124000, isStub: true });
    }

    // 1. Verify signature
    const valid = verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!valid) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 422 }
      );
    }

    // 2. Look up the DB order record
    const dbOrder = await prisma.razorpayOrder.findUnique({
      where: { razorpayOrderId },
    });

    if (!dbOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (dbOrder.status === "paid") {
      // Idempotent — already credited
      const user = await prisma.user.findUnique({
        where:  { id: dbOrder.userId },
        select: { walletBalancePaise: true },
      });
      return NextResponse.json({ ok: true, newBalancePaise: user?.walletBalancePaise ?? 0 });
    }

    // 3. Credit wallet + mark order paid.
    // Race-safe vs the webhook path: the conditional updateMany only succeeds
    // for the FIRST writer; if the webhook already credited, count === 0.
    const newBalance = await prisma.$transaction(async (tx) => {
      const marked = await tx.razorpayOrder.updateMany({
        where: { razorpayOrderId, status: { not: "paid" } },
        data: {
          status:             "paid",
          razorpayPaymentId,
          razorpaySignature,
        },
      });

      if (marked.count === 0) {
        // Webhook won the race — skip credit, just return current balance
        const user = await tx.user.findUnique({
          where:  { id: dbOrder.userId },
          select: { walletBalancePaise: true },
        });
        return user?.walletBalancePaise ?? 0;
      }

      await tx.walletEntry.create({
        data: {
          userId:      dbOrder.userId,
          type:        "topup",
          amountPaise: dbOrder.amountPaise,
          description: `Razorpay top-up (${dbOrder.purpose})`,
          reference:   razorpayPaymentId,
          status:      "completed",
        },
      });
      const updated = await tx.user.update({
        where:  { id: dbOrder.userId },
        data:   { walletBalancePaise: { increment: dbOrder.amountPaise } },
        select: { walletBalancePaise: true },
      });
      return updated.walletBalancePaise;
    });

    return NextResponse.json({ ok: true, newBalancePaise: newBalance });
  } catch (e) {
    console.error("[wallet/payment/verify]", e);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
