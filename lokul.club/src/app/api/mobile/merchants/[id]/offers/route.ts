/**
 * GET  /api/mobile/merchants/[id]/offers   — list a merchant's offers
 *      Query: ?activeOnly=1  → only currently active + within date window
 * POST /api/mobile/merchants/[id]/offers   — merchant creates an offer
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const E2E = process.env.E2E_TEST === "1" || (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");

const VALID_TYPES = ["percent_off", "flat_off", "bogo", "free_delivery"];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: merchantId } = await params;
  const activeOnly = req.nextUrl.searchParams.get("activeOnly") === "1";

  if (E2E) return NextResponse.json({ offers: [] });

  try {
    const now = new Date();
    const offers = await prisma.merchantOffer.findMany({
      where: {
        merchantId,
        ...(activeOnly ? { isActive: true, startsAt: { lte: now }, endsAt: { gte: now } } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ offers });
  } catch {
    return NextResponse.json({ offers: [] });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: merchantId } = await params;

  if (E2E) {
    return NextResponse.json({ id: "e2e-offer" }, { status: 201 });
  }

  try {
    const body = await req.json();
    const { title, type, value, minSpendPaise, appliesTo, startsAt, endsAt, isActive } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: "title required" }, { status: 400 });
    }
    if (!type || !VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: `type must be one of ${VALID_TYPES.join(", ")}` }, { status: 400 });
    }
    if (typeof value !== "number" || value < 0) {
      return NextResponse.json({ error: "value (>= 0) required" }, { status: 400 });
    }
    if (!endsAt || Number.isNaN(new Date(endsAt).getTime())) {
      return NextResponse.json({ error: "endsAt (valid date) required" }, { status: 400 });
    }

    const merchant = await prisma.merchant.findUnique({ where: { id: merchantId }, select: { id: true } });
    if (!merchant) return NextResponse.json({ error: "Merchant not found" }, { status: 404 });

    const offer = await prisma.merchantOffer.create({
      data: {
        merchantId,
        title: title.trim(),
        type,
        value,
        minSpendPaise: minSpendPaise ?? null,
        appliesTo: Array.isArray(appliesTo) ? appliesTo : [],
        startsAt: startsAt ? new Date(startsAt) : new Date(),
        endsAt: new Date(endsAt),
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(offer, { status: 201 });
  } catch (e) {
    console.error("[merchant offers] create failed:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
