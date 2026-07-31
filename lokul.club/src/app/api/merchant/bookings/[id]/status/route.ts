import { NextRequest, NextResponse } from "next/server";
import { requireMerchant } from "@/lib/merchant-auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { merchantId } = await requireMerchant();
  const { id } = await params;
  const { action, reason } = await request.json();

  const appointment = await prisma.appointment.findFirst({
    where: { id, merchantId },
    include: { user: { select: { id: true } } },
  });
  if (!appointment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const statusMap: Record<string, string> = {
    confirm: "confirmed",
    cancel: "cancelled",
    complete: "completed",
  };
  const newStatus = statusMap[action];
  if (!newStatus) return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  const updated = await prisma.appointment.update({
    where: { id },
    data: {
      status: newStatus as "pending" | "confirmed" | "cancelled" | "completed",
      ...(action === "cancel" && reason ? { cancellationReason: reason } : {}),
    },
  });

  try {
    const { sendPush } = await import("@/lib/push");
    const messages: Record<string, string> = {
      confirm: "Your appointment has been confirmed.",
      cancel: `Your appointment has been cancelled.${reason ? ` Reason: ${reason}` : ""}`,
      complete: "Your appointment is marked as complete. Please rate your experience.",
    };
    await sendPush(
      { userId: appointment.user.id },
      { title: "Booking Update", body: messages[action] ?? "Your booking status changed." }
    );
  } catch {
    // push optional
  }

  return NextResponse.json({ appointment: updated });
}
