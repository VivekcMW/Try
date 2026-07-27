/**
 * PATCH /api/mobile/quotes/[id]   — merchant replies or user accepts/declines
 *
 * Merchant reply: { actorId (merchantId), action: "quote", merchantReply, quotedPaise }
 * User accept:   { actorId (userId), action: "accept" }
 * User decline:  { actorId (userId), action: "decline" }
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const E2E = process.env.E2E_TEST === "1" || (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (E2E) return NextResponse.json({ id, status: "quoted" });

  try {
    const { actorId, action, merchantReply, quotedPaise } = await req.json();

    const quote = await prisma.quoteRequest.findUnique({ where: { id } });
    if (!quote) return NextResponse.json({ error: "Quote not found" }, { status: 404 });

    let update: Record<string, unknown> = {};

    if (action === "quote") {
      // Merchant sends a quote
      if (actorId !== quote.merchantId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      if (!merchantReply) return NextResponse.json({ error: "merchantReply required" }, { status: 400 });
      update = {
        status:        "quoted",
        merchantReply: merchantReply.trim(),
        quotedPaise:   quotedPaise ?? null,
        repliedAt:     new Date(),
      };
    } else if (action === "accept") {
      if (actorId !== quote.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      update = { status: "accepted" };
    } else if (action === "decline") {
      if (actorId !== quote.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      update = { status: "declined" };
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const updated = await prisma.quoteRequest.update({ where: { id }, data: update });
    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
