/**
 * Razorpay server-side utility.
 *
 * Environment variables required (set in .env.local / Vercel):
 *   RAZORPAY_KEY_ID       — from Razorpay Dashboard → Settings → API Keys
 *   RAZORPAY_KEY_SECRET   — keep this server-side ONLY
 *   RAZORPAY_WEBHOOK_SECRET — from Razorpay Dashboard → Webhooks
 */
import Razorpay from "razorpay";
import crypto from "crypto";

let _client: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  if (_client) return _client;
  const key_id     = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error(
      "RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set to use Razorpay"
    );
  }
  _client = new Razorpay({ key_id, key_secret });
  return _client;
}

export function isRazorpayConfigured(): boolean {
  return !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

/** Create a Razorpay order for a wallet top-up or subscription. */
export async function createRazorpayOrder(opts: {
  amountPaise: number;
  currency?: string;
  receipt: string; // e.g. "wallet_<userId>_<ts>" or "sub_<userId>_plus"
  notes?: Record<string, string>;
}) {
  const rp = getRazorpay();
  const order = await rp.orders.create({
    amount:   opts.amountPaise,
    currency: opts.currency ?? "INR",
    receipt:  opts.receipt.slice(0, 40), // Razorpay max 40 chars
    notes:    opts.notes ?? {},
  });
  return order;
}

/**
 * Verify Razorpay payment signature.
 * HMAC-SHA256(orderId + "|" + paymentId, key_secret) must equal the signature
 * sent by the Razorpay checkout SDK.
 */
export function verifyPaymentSignature(opts: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) throw new Error("RAZORPAY_KEY_SECRET not configured");

  const body     = `${opts.razorpayOrderId}|${opts.razorpayPaymentId}`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expected, "hex"),
    Buffer.from(opts.razorpaySignature, "hex")
  );
}

/**
 * Verify Razorpay webhook signature.
 * HMAC-SHA256(raw body, webhook_secret) must equal X-Razorpay-Signature header.
 */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false; // webhook validation disabled in dev

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(signature, "hex")
    );
  } catch {
    return false;
  }
}
