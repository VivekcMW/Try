/**
 * PATCH  /api/mobile/merchants/[id]/offers/[offerId]   — update an offer (e.g. toggle isActive)
 * DELETE /api/mobile/merchants/[id]/offers/[offerId]   — remove an offer
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const E2E = process.env.E2E_TEST === "1" || (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; offerId: string }> }
) {
  const { id: merchantId, offerId } = await params;

  if (E2E) return NextResponse.json({ id: offerId });

  try {
    const body = await req.json();
    const { title, type, value, minSpendPaise, appliesTo, startsAt, endsAt, isActive } = body;

    const existing = await prisma.merchantOffer.findUnique({ where: { id: offerId } });
    if (!existing || existing.merchantId !== merchantId) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    const offer = await prisma.merchantOffer.update({
      where: { id: offerId },
      data: {
        ...(title !== undefined ? { title: String(title).trim() } : {}),
        ...(type !== undefined ? { type } : {}),
        ...(value !== undefined ? { value } : {}),
        ...(minSpendPaise !== undefined ? { minSpendPaise } : {}),
        ...(appliesTo !== undefined ? { appliesTo } : {}),
        ...(startsAt !== undefined ? { startsAt: new Date(startsAt) } : {}),
        ...(endsAt !== undefined ? { endsAt: new Date(endsAt) } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      },
    });

    return NextResponse.json(offer);
  } catch (e) {
    console.error("[merchant offers] update failed:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; offerId: string }> }
) {
  const { id: merchantId, offerId } = await params;

  if (E2E) return NextResponse.json({ deleted: true });

  try {
    const existing = await prisma.merchantOffer.findUnique({ where: { id: offerId } });
    if (!existing || existing.merchantId !== merchantId) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    await prisma.merchantOffer.delete({ where: { id: offerId } });
    return NextResponse.json({ deleted: true });
  } catch (e) {
    console.error("[merchant offers] delete failed:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
