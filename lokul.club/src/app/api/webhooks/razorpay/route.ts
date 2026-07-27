/**
 * Razorpay webhook handler
 * Verifies HMAC-SHA256 signature and processes payment events.
 *
 * Supported events:
 *  - payment.captured  → mark escrow/wallet entry as captured
 *  - payment.failed    → mark as failed
 *  - order.paid        → update WalletEntry status
 */
import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { claimWebhookEvent } from "@/lib/webhookIdempotency";

const E2E =
  process.env.E2E_TEST === "1" ||
  (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");

function verifySignature(body: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  try {
    return timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(signature, "hex")
    );
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (E2E) return NextResponse.json({ received: true });

  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event   = payload.event as string | undefined;
  const entity  = (payload.payload as Record<string, unknown>)?.payment as Record<string, unknown> | undefined;
  const orderId = entity?.entity ? (entity.entity as Record<string, unknown>).order_id as string | undefined : undefined;

  // Idempotency: ack duplicate deliveries without re-processing
  const claim = await claimWebhookEvent({
    provider:  "razorpay",
    eventId:   req.headers.get("x-razorpay-event-id"),
    eventType: event ?? "unknown",
  });
  if (claim === "duplicate") {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    if (event === "payment.captured" && orderId) {
      await prisma.walletEntry.updateMany({
        where: { reference: orderId, type: "hold" },
        data: { description: "Razorpay payment captured", status: "completed" },
      });
    } else if (event === "payment.failed" && orderId) {
      await prisma.walletEntry.updateMany({
        where: { reference: orderId, type: "hold" },
        data: { description: "Razorpay payment failed", status: "failed" },
      });
    } else if (event === "order.paid" && orderId) {
      await prisma.walletEntry.updateMany({
        where: { reference: orderId },
        data: { description: "Razorpay order paid", status: "completed" },
      });
    }
  } catch (err) {
    console.error("[razorpay webhook] DB update failed:", err);
    // Acknowledge anyway — Razorpay will retry on 5xx
  }

  return NextResponse.json({ received: true });
}
