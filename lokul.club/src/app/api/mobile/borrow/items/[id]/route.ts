/**
 * GET /api/mobile/borrow/items/[id] — item detail
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const item = await prisma.borrowItem.findUnique({
      where: { id },
      include: { owner: { select: { id: true, name: true } } },
    });

    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: "Failed to load item" }, { status: 500 });
  }
}
