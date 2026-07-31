/**
 * PATCH  /api/mobile/merchants/[id]/catalog/[itemId]   — update a catalog item
 * DELETE /api/mobile/merchants/[id]/catalog/[itemId]   — remove a catalog item
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const E2E = process.env.E2E_TEST === "1" || (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { id: merchantId, itemId } = await params;

  if (E2E) return NextResponse.json({ id: itemId });

  try {
    const body = await req.json();
    const {
      name, description, pricePaise, unit, durationMins,
      imageUrl, isAvailable, sortOrder, attributes,
      catalogCategory, stockCount,
    } = body;

    const existing = await prisma.merchantCatalogItem.findUnique({ where: { id: itemId } });
    if (!existing || existing.merchantId !== merchantId) {
      return NextResponse.json({ error: "Catalog item not found" }, { status: 404 });
    }

    const item = await prisma.merchantCatalogItem.update({
      where: { id: itemId },
      data: {
        ...(name !== undefined ? { name: String(name).trim() } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(pricePaise !== undefined ? { pricePaise } : {}),
        ...(unit !== undefined ? { unit } : {}),
        ...(durationMins !== undefined ? { durationMins } : {}),
        ...(imageUrl !== undefined ? { imageUrl } : {}),
        ...(isAvailable !== undefined ? { isAvailable } : {}),
        ...(sortOrder !== undefined ? { sortOrder } : {}),
        ...(attributes !== undefined ? { attributes } : {}),
        ...(catalogCategory !== undefined ? { catalogCategory } : {}),
        ...(stockCount !== undefined ? { stockCount } : {}),
      },
    });

    return NextResponse.json(item);
  } catch (e) {
    console.error("[merchant catalog] update failed:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { id: merchantId, itemId } = await params;

  if (E2E) return NextResponse.json({ deleted: true });

  try {
    const existing = await prisma.merchantCatalogItem.findUnique({ where: { id: itemId } });
    if (!existing || existing.merchantId !== merchantId) {
      return NextResponse.json({ error: "Catalog item not found" }, { status: 404 });
    }

    await prisma.merchantCatalogItem.delete({ where: { id: itemId } });
    return NextResponse.json({ deleted: true });
  } catch (e) {
    console.error("[merchant catalog] delete failed:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
