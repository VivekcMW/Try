/**
 * GET /api/mobile/insurance/policies/[id] — policy detail
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const policy = await prisma.insurancePolicy.findUnique({ where: { id } });
    if (!policy) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ policy });
  } catch {
    return NextResponse.json({ error: "Failed to load policy" }, { status: 500 });
  }
}
