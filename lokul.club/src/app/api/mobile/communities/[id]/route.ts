/**
 * GET /api/mobile/communities/[id] — get community detail including threadId
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const community = await prisma.community.findUnique({
    where: { id },
    include: {
      threads: { select: { id: true }, take: 1 },
      _count: { select: { members: true } },
    },
  });

  if (!community) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: community.id,
    name: community.name,
    type: community.type,
    joinPolicy: community.joinPolicy,
    description: community.description,
    coverUrl: community.coverUrl,
    memberCount: community._count.members,
    threadId: community.threads[0]?.id ?? null,
  });
}
