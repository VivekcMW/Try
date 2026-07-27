/**
 * GET /api/mobile/kids/tutors/[id] — tutor profile detail
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const tutor = await prisma.kidsTutorProfile.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true } } },
    });
    if (!tutor) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ tutor });
  } catch {
    return NextResponse.json({ error: "Failed to load tutor" }, { status: 500 });
  }
}
