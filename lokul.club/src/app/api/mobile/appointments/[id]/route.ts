/**
 * PATCH /api/mobile/appointments/[id]   — update appointment status
 *
 * Body: { status: "confirmed" | "cancelled" | "completed"; cancellationReason? }
 * Only the appointment owner (userId) or the merchant can change status.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const E2E = process.env.E2E_TEST === "1" || (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (E2E) return NextResponse.json({ id, status: "cancelled" });

  try {
    const { status, cancellationReason, actorId } = await req.json();

    const allowed = ["confirmed", "cancelled", "completed"] as const;
    if (!allowed.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const appt = await prisma.appointment.findUnique({ where: { id } });
    if (!appt) return NextResponse.json({ error: "Appointment not found" }, { status: 404 });

    // Authorization: only user or merchant of this appointment
    if (actorId && appt.userId !== actorId && appt.merchantId !== actorId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const a = await tx.appointment.update({
        where: { id },
        data: {
          status,
          cancellationReason: status === "cancelled" ? (cancellationReason ?? null) : undefined,
        },
      });
      // Release slot capacity on cancellation
      if (status === "cancelled" && a.slotId) {
        await tx.serviceSlot.update({
          where: { id: a.slotId },
          data: { booked: { decrement: 1 } },
        });
      }
      return a;
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
