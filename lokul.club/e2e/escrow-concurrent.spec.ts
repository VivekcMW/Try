/**
 * Escrow concurrent-booking load test
 *
 * Tests that 10 simultaneous escrow reservation calls for the same slot
 * only succeed up to the slot capacity (no double-booking).
 *
 * Run with:  npx playwright test e2e/escrow-concurrent.spec.ts
 *
 * The test creates a slot with capacity=5, fires 10 concurrent booking
 * requests, then asserts:
 *   - At most 5 succeed (201)
 *   - At least some receive 409 (conflict / fully booked)
 *   - Total booked count in DB equals capacity (not over-booked)
 */
import { test, expect } from "@playwright/test";

const BASE = process.env.BASE_URL ?? process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${process.env.E2E_PORT ?? 3398}`;

// Seed IDs — safe for E2E because the API returns 200 stub data in E2E mode
const MERCHANT_ID = "e2e-merchant-escrow";
const USER_PREFIX = "e2e-user-escrow-";
const SLOT_DATE   = "2099-01-01";

test.describe("Escrow slot concurrency", () => {
  // Test 2 reads state that Test 1 mutates — keep them serial within this file.
  test.describe.configure({ mode: "serial" });
  let slotId: string;

  test.beforeAll(async ({ request }) => {
    const res = await request.post(
      `${BASE}/api/mobile/merchants/${MERCHANT_ID}/slots`,
      {
        data: {
          slots: [
            {
              date:      SLOT_DATE,
              startTime: "10:00",
              endTime:   "10:30",
              capacity:  5,
            },
          ],
        },
      }
    );
    const body = await res.json();
    slotId = body.slots?.[0]?.id ?? body.created?.[0]?.id ?? "stub-slot-id";
    expect(slotId, "slot creation returned an id").not.toBe("stub-slot-id");
  });

  test("10 concurrent bookings respect capacity=5", async ({ request }) => {
    const CONCURRENCY = 10;
    const CAPACITY    = 5;

    const requests = Array.from({ length: CONCURRENCY }, (_, i) =>
      request.post(`${BASE}/api/mobile/appointments`, {
        data: {
          userId:       `${USER_PREFIX}${i}`,
          merchantId:   MERCHANT_ID,
          slotId,
          serviceLabel: "Concurrent load test",
          scheduledAt:  `${SLOT_DATE}T10:00:00.000Z`,
        },
      })
    );

    const responses = await Promise.all(requests);
    const statuses  = responses.map((r) => r.status());

    const succeeded  = statuses.filter((s) => s === 201).length;
    const conflicted = statuses.filter((s) => s === 409).length;

    expect(succeeded).toBe(CAPACITY);
    expect(conflicted).toBe(CONCURRENCY - CAPACITY);
    expect(succeeded + conflicted).toBe(CONCURRENCY);
  });

  test("Slot booked count never exceeds capacity", async ({ request }) => {
    const res  = await request.get(
      `${BASE}/api/mobile/merchants/${MERCHANT_ID}/slots?date=${SLOT_DATE}`
    );
    const body = await res.json();
    const slot = (body.slots as Array<{ id: string; booked: number; capacity: number }> | undefined)
      ?.find((s) => s.id === slotId);

    expect(slot, "slot is visible via GET").toBeDefined();
    expect(slot!.booked).toBeLessThanOrEqual(slot!.capacity);
    expect(slot!.booked).toBe(slot!.capacity);
  });
});
