/**
 * Cashfree webhook handler
 * Verifies HMAC-SHA256 signature and processes payment events.
 *
 * Cashfree signs: `timestamp.rawBody`
 * Signature header: `x-webhook-signature`
 * Timestamp header: `x-webhook-timestamp`
 *
 * Supported events:
 *  - PAYMENT_SUCCESS_WEBHOOK  → mark WalletEntry as captured
 *  - PAYMENT_FAILED_WEBHOOK   → mark as failed
 *  - REFUND_STATUS_WEBHOOK    → log refund
 */
import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";

const E2E =
  process.env.E2E_TEST === "1" ||
  (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");

function verifySignature(
  timestamp: string,
  body: string,
  signature: string
): boolean {
  const secret = process.env.CASHFREE_WEBHOOK_SECRET;
  if (!secret) return false;
  const message  = `${timestamp}.${body}`;
  const expected = createHmac("sha256", secret).update(message).digest("base64");
  try {
    return timingSafeEqual(
      Buffer.from(expected, "base64"),
      Buffer.from(signature, "base64")
    );
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (E2E) return NextResponse.json({ received: true });

  const rawBody  = await req.text();
  const timestamp = req.headers.get("x-webhook-timestamp") ?? "";
  const signature = req.headers.get("x-webhook-signature") ?? "";

  if (!verifySignature(timestamp, rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = payload.type as string | undefined;
  const data  = payload.data as Record<string, unknown> | undefined;
  const orderId = data?.order
    ? (data.order as Record<string, unknown>).order_id as string | undefined
    : undefined;

  try {
    if (event === "PAYMENT_SUCCESS_WEBHOOK" && orderId) {
      await prisma.walletEntry.updateMany({
        where: { reference: orderId, type: "hold" },
        data: { description: "Cashfree payment success", status: "completed" },
      });
    } else if (event === "PAYMENT_FAILED_WEBHOOK" && orderId) {
      await prisma.walletEntry.updateMany({
        where: { reference: orderId, type: "hold" },
        data: { description: "Cashfree payment failed", status: "failed" },
      });
    } else if (event === "REFUND_STATUS_WEBHOOK" && orderId) {
      const refundId = data?.refund
        ? (data.refund as Record<string, unknown>).refund_id as string
        : "unknown";
      await prisma.walletEntry.updateMany({
        where: { reference: orderId },
        data: { description: `Cashfree refund ${refundId}`, status: "reversed" },
      });
    }
  } catch (err) {
    console.error("[cashfree webhook] DB update failed:", err);
  }

  return NextResponse.json({ received: true });
}
