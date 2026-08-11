/**
 * GET  /api/mobile/merchants/[id]/staff — list active staff (staff/doctor picker)
 * POST /api/mobile/merchants/[id]/staff — merchant adds a staff member
 *      { name, role, avatarUrl?, rating?, years? }
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { E2E } from "@/lib/bookings";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: merchantId } = await params;
  if (E2E) return NextResponse.json({ items: [] });

  try {
    const items = await prisma.merchantStaff.findMany({
      where: { merchantId, isActive: true },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: merchantId } = await params;
  if (E2E) return NextResponse.json({ id: "e2e-staff" }, { status: 201 });

  try {
    const { name, role, avatarUrl, rating, years } = await req.json();
    if (!name || !role) {
      return NextResponse.json({ error: "name and role required" }, { status: 400 });
    }

    const merchant = await prisma.merchant.findUnique({ where: { id: merchantId } });
    if (!merchant) return NextResponse.json({ error: "Merchant not found" }, { status: 404 });

    const staff = await prisma.merchantStaff.create({
      data: {
        merchantId,
        name,
        role,
        avatarUrl: avatarUrl ?? null,
        rating: rating ?? null,
        years: years ?? null,
      },
    });
    return NextResponse.json(staff, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
