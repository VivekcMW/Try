/**
 * In-memory escrow capacity store for E2E mode only.
 *
 * Real production code path goes through `prisma.$transaction` against
 * Postgres. In E2E mode the appointment / slot routes return stub data and
 * never touch the DB, which means the concurrent-booking contract is not
 * exercised. This module gives us just enough state to enforce capacity in
 * the same Node process so `e2e/escrow-concurrent.spec.ts` can run without
 * Postgres.
 *
 * Concurrency note: Node runs JS on a single thread, but `await` boundaries
 * inside route handlers allow interleaving. We serialise the
 * check-then-increment via a per-slot promise chain so concurrent POSTs
 * behave like SERIALIZABLE.
 */

type SlotRow = { id: string; merchantId: string; date: string; startTime: string; endTime: string; capacity: number; booked: number };

const slots: Map<string, SlotRow> = new Map();
const slotMutex: Map<string, Promise<unknown>> = new Map();

function withSlotLock<T>(slotId: string, fn: () => Promise<T>): Promise<T> {
  const prev = slotMutex.get(slotId) ?? Promise.resolve();
  const next = prev.then(fn, fn);
  slotMutex.set(slotId, next.catch(() => undefined));
  return next;
}

function makeId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function e2eCreateSlots(
  merchantId: string,
  rows: Array<{ date: string; startTime: string; endTime: string; capacity?: number }>,
): SlotRow[] {
  const created: SlotRow[] = [];
  for (const r of rows) {
    const row: SlotRow = {
      id:        makeId("slot"),
      merchantId,
      date:      r.date,
      startTime: r.startTime,
      endTime:   r.endTime,
      capacity:  r.capacity ?? 1,
      booked:    0,
    };
    slots.set(row.id, row);
    created.push(row);
  }
  return created;
}

export function e2eListSlots(merchantId: string, date: string): SlotRow[] {
  return Array.from(slots.values()).filter((s) => s.merchantId === merchantId && s.date === date);
}

export type EscrowReserveResult =
  | { ok: true; appointmentId: string }
  | { ok: false; status: 404 | 409; error: string };

export function e2eReserve(slotId: string | null | undefined): Promise<EscrowReserveResult> {
  if (!slotId) {
    return Promise.resolve({ ok: true, appointmentId: makeId("appt") });
  }
  return withSlotLock(slotId, async () => {
    const s = slots.get(slotId);
    if (!s) return { ok: false, status: 404, error: "Slot not found" };
    if (s.booked >= s.capacity) return { ok: false, status: 409, error: "Slot fully booked" };
    s.booked += 1;
    return { ok: true, appointmentId: makeId("appt") };
  });
}

export function e2eResetEscrow(): void {
  slots.clear();
  slotMutex.clear();
}
