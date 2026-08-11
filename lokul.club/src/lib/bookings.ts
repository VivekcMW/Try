import { randomInt } from "node:crypto";
import type { Prisma, BookingStatus } from "@/generated/prisma/client";

export const E2E =
  process.env.E2E_TEST === "1" ||
  (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");

export const BOOKING_INCLUDE = {
  merchant: { select: { id: true, name: true, category: true, avatarUrl: true } },
  customer: { select: { id: true, name: true, avatarUrl: true } },
  staff: true,
  items: true,
  quotes: { orderBy: { createdAt: "desc" as const } },
  milestones: { orderBy: { sortOrder: "asc" as const } },
  legs: true,
  statusHistory: { orderBy: { createdAt: "asc" as const } },
} satisfies Prisma.ServiceBookingInclude;

export async function logBookingStatus(
  tx: Prisma.TransactionClient,
  bookingId: string,
  fromStatus: BookingStatus | null,
  toStatus: BookingStatus,
  changedBy: string,
  reason?: string | null
) {
  await tx.bookingStatusHistory.create({
    data: { bookingId, fromStatus, toStatus, changedBy, reason: reason ?? null },
  });
}

export function generateOtp(): string {
  return String(randomInt(1000, 10000));
}
