/**
 * Webhook idempotency — insert-first claim on (provider, eventId).
 *
 * Razorpay delivers every webhook with a unique `x-razorpay-event-id` header
 * and retries on non-2xx for up to 24h. Claiming the event id BEFORE any
 * side-effects guarantees each event is processed at most once, even under
 * concurrent duplicate deliveries (unique constraint wins the race).
 */
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export type ClaimResult = "claimed" | "duplicate" | "unavailable";

/**
 * Attempt to claim a webhook event for processing.
 *  - "claimed"     → first delivery, proceed with side-effects
 *  - "duplicate"   → already processed, ack with 200 and skip
 *  - "unavailable" → no event id or DB error; caller decides (fail open + rely
 *                    on downstream status checks)
 */
export async function claimWebhookEvent(opts: {
  provider: string;
  eventId: string | null;
  eventType: string;
}): Promise<ClaimResult> {
  if (!opts.eventId) return "unavailable";
  try {
    await prisma.webhookEvent.create({
      data: {
        provider:  opts.provider,
        eventId:   opts.eventId,
        eventType: opts.eventType,
      },
    });
    return "claimed";
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return "duplicate"; // unique (provider, eventId) violated → already seen
    }
    console.error("[webhook idempotency] claim failed:", err);
    return "unavailable";
  }
}
