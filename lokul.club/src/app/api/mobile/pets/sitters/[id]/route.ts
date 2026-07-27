/**
 * GET /api/mobile/pets/sitters/[id] — sitter detail
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const sitter = await prisma.petSitterProfile.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true } } },
    });

    if (!sitter) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ sitter });
  } catch {
    return NextResponse.json({ error: "Failed to load sitter" }, { status: 500 });
  }
}
