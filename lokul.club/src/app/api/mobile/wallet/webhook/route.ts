/**
 * POST /api/mobile/wallet/webhook
 * Razorpay webhook handler — server-to-server authoritative confirmation.
 *
 * Verify the X-Razorpay-Signature header before processing any event.
 * Handles:
 *   payment.captured  — credit wallet (idempotent via RazorpayOrder.status)
 *   payment.failed    — mark order failed
 *
 * Configure in Razorpay Dashboard → Webhooks → Active Events:
 *   ✓ payment.captured
 *   ✓ payment.failed
 * Webhook secret: set as RAZORPAY_WEBHOOK_SECRET env var.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { claimWebhookEvent } from "@/lib/webhookIdempotency";

export async function POST(req: NextRequest) {
  const rawBody  = await req.text();
  const sig      = req.headers.get("x-razorpay-signature") ?? "";
  const eventId  = req.headers.get("x-razorpay-event-id");

  // Validate signature (returns true in dev if RAZORPAY_WEBHOOK_SECRET not set)
  if (!verifyWebhookSignature(rawBody, sig)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: {
    event: string;
    payload?: {
      payment?: {
        entity?: {
          id?: string;
          order_id?: string;
          amount?: number;
          status?: string;
        };
      };
    };
  };

  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payment = event?.payload?.payment?.entity;
  if (!payment) return NextResponse.json({ ok: true }); // unrecognized event, ack

  // Idempotency: claim the Razorpay event id before any side-effects.
  // Duplicate deliveries (Razorpay retries) are acked without re-processing.
  const claim = await claimWebhookEvent({
    provider:  "razorpay",
    eventId,
    eventType: event.event,
  });
  if (claim === "duplicate") {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  const razorpayOrderId   = payment.order_id  ?? "";
  const razorpayPaymentId = payment.id         ?? "";

  const dbOrder = await prisma.razorpayOrder.findUnique({
    where: { razorpayOrderId },
  }).catch(() => null);

  if (!dbOrder) {
    // Order not in our DB — possibly a legacy / test event; ack and skip
    return NextResponse.json({ ok: true });
  }

  if (event.event === "payment.captured") {
    // Race-safe credit: the conditional updateMany only succeeds for the FIRST
    // writer (webhook vs client-side /payment/verify). If another path already
    // flipped the order to "paid", count === 0 and we skip the credit.
    await prisma.$transaction(async (tx) => {
      const marked = await tx.razorpayOrder.updateMany({
        where: { razorpayOrderId, status: { not: "paid" } },
        data:  { status: "paid", razorpayPaymentId },
      });
      if (marked.count === 0) return; // already credited — idempotent skip

      await tx.walletEntry.create({
        data: {
          userId:      dbOrder.userId,
          type:        "topup",
          amountPaise: dbOrder.amountPaise,
          description: `Razorpay webhook (${dbOrder.purpose})`,
          reference:   razorpayPaymentId,
          status:      "completed",
        },
      });
      await tx.user.update({
        where: { id: dbOrder.userId },
        data:  { walletBalancePaise: { increment: dbOrder.amountPaise } },
      });
    });
  } else if (event.event === "payment.failed") {
    if (dbOrder.status !== "paid") {
      await prisma.razorpayOrder.update({
        where: { razorpayOrderId },
        data:  { status: "failed" },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
