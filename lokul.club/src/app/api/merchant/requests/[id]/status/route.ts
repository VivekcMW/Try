import { NextRequest, NextResponse } from "next/server";
import { requireMerchant } from "@/lib/merchant-auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { merchantId } = await requireMerchant();
    const { id } = await params;
    const { action } = await request.json();

    if (action !== "decline" && action !== "accept") {
      return NextResponse.json({ error: "action must be 'decline' or 'accept'" }, { status: 400 });
    }

    const req = await prisma.quoteRequest.findFirst({ where: { id, merchantId } });
    if (!req) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const newStatus = action === "decline" ? "declined" : "accepted";

    const updated = await prisma.quoteRequest.update({
      where: { id },
      data: { status: newStatus },
      include: { user: { select: { id: true, name: true } } },
    });

    try {
      const { sendPush } = await import("@/lib/push");
      const title = newStatus === "accepted" ? "Quote Accepted" : "Request Declined";
      const body =
        newStatus === "accepted"
          ? "Great news! Your service request has been accepted."
          : "Your service request has been declined by the provider.";
      await sendPush({ userId: updated.user.id }, { title, body });
    } catch {
      /* push optional */
    }

    return NextResponse.json({ request: updated });
  } catch (error: any) {
    if (error?.message?.startsWith("Unauthorized"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
