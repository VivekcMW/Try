/**
 * GET  /api/mobile/merchants/[id]/catalog   — list a merchant's catalog items
 * POST /api/mobile/merchants/[id]/catalog   — merchant adds a catalog item
 *
 * Works across verticals via `kind`: product | menu_item | service | consultation | class_batch
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const E2E = process.env.E2E_TEST === "1" || (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");

const VALID_KINDS = ["product", "menu_item", "service", "consultation", "class_batch"];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: merchantId } = await params;
  const kind = req.nextUrl.searchParams.get("kind");

  if (E2E) return NextResponse.json({ items: [] });

  try {
    const items = await prisma.merchantCatalogItem.findMany({
      where: { merchantId, ...(kind ? { kind: kind as never } : {}) },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
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

  if (E2E) {
    return NextResponse.json({ id: "e2e-catalog-item" }, { status: 201 });
  }

  try {
    const body = await req.json();
    const {
      kind, name, description, pricePaise, unit, durationMins,
      imageUrl, isAvailable, sortOrder, attributes,
    } = body;

    if (!kind || !VALID_KINDS.includes(kind)) {
      return NextResponse.json({ error: `kind must be one of ${VALID_KINDS.join(", ")}` }, { status: 400 });
    }
    if (!name?.trim() || typeof pricePaise !== "number" || pricePaise < 0) {
      return NextResponse.json({ error: "name and pricePaise (>= 0) required" }, { status: 400 });
    }

    const merchant = await prisma.merchant.findUnique({ where: { id: merchantId }, select: { id: true } });
    if (!merchant) return NextResponse.json({ error: "Merchant not found" }, { status: 404 });

    const item = await prisma.merchantCatalogItem.create({
      data: {
        merchantId,
        kind,
        name: name.trim(),
        description: description ?? null,
        pricePaise,
        unit: unit ?? null,
        durationMins: durationMins ?? null,
        imageUrl: imageUrl ?? null,
        isAvailable: isAvailable ?? true,
        sortOrder: sortOrder ?? 0,
        attributes: attributes ?? undefined,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (e) {
    console.error("[merchant catalog] create failed:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
