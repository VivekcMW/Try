/**
 * GET  /api/mobile/merchants/[id]/slots   — available service slots for a date
 * POST /api/mobile/merchants/[id]/slots   — merchant creates a slot schedule
 *
 * GET params: date (YYYY-MM-DD, required)
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { e2eCreateSlots, e2eListSlots } from "@/lib/e2e-escrow";

const E2E = process.env.E2E_TEST === "1" || (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: merchantId } = await params;
  const { searchParams }   = req.nextUrl;
  const date = searchParams.get("date");

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "date (YYYY-MM-DD) required" }, { status: 400 });
  }

  if (E2E) {
    return NextResponse.json({ slots: e2eListSlots(merchantId, date) });
  }

  try {
    const slots = await prisma.serviceSlot.findMany({
      where: { merchantId, date },
      orderBy: { startTime: "asc" },
    });
    return NextResponse.json({ slots });
  } catch {
    return NextResponse.json({ slots: [] });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: merchantId } = await params;

  if (E2E) {
    const { slots: input } = (await req.json().catch(() => ({ slots: [] }))) as {
      slots?: Array<{ date: string; startTime: string; endTime: string; capacity?: number }>;
    };
    const created = e2eCreateSlots(merchantId, input ?? []);
    return NextResponse.json({ slots: created, created: created.length }, { status: 201 });
  }

  try {
    const { slots } = await req.json() as {
      slots: Array<{ date: string; startTime: string; endTime: string; capacity?: number }>;
    };

    if (!Array.isArray(slots) || slots.length === 0) {
      return NextResponse.json({ error: "slots[] required" }, { status: 400 });
    }
    if (slots.length > 100) {
      return NextResponse.json({ error: "Maximum 100 slots per request" }, { status: 400 });
    }

    // Validate merchantId exists
    const merchant = await prisma.merchant.findUnique({ where: { id: merchantId }, select: { id: true } });
    if (!merchant) return NextResponse.json({ error: "Merchant not found" }, { status: 404 });

    const created = await prisma.serviceSlot.createMany({
      data: slots.map((s) => ({
        merchantId,
        date:      s.date,
        startTime: s.startTime,
        endTime:   s.endTime,
        capacity:  s.capacity ?? 1,
      })),
      skipDuplicates: true,
    });

    return NextResponse.json({ created: created.count }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
