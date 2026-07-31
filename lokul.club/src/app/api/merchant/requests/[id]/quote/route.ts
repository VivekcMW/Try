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
    const { quotedPaise, note } = await request.json();

    if (!quotedPaise || quotedPaise <= 0) {
      return NextResponse.json({ error: "quotedPaise must be > 0" }, { status: 400 });
    }

    const req = await prisma.quoteRequest.findFirst({ where: { id, merchantId } });
    if (!req) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await prisma.quoteRequest.update({
      where: { id },
      data: {
        status: "quoted",
        quotedPaise,
        merchantReply: note ?? null,
        repliedAt: new Date(),
      },
      include: { user: { select: { id: true, name: true } } },
    });

    try {
      const { sendPush } = await import("@/lib/push");
      await sendPush(
        { userId: updated.user.id },
        { title: "New Quote Received", body: "You have a new quote from a service provider. Tap to view." }
      );
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
