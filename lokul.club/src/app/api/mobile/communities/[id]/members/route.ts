/**
 * GET /api/mobile/communities/[id]/members — list active members of a community
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: communityId } = await params;

  try {
    const members = await prisma.communityMember.findMany({
      where: { communityId, status: "active" },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true, kycTier: true } },
      },
      orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
    });

    return NextResponse.json({
      items: members.map((m) => ({
        id: m.user.id,
        name: m.user.name,
        avatarUrl: m.user.avatarUrl,
        kycTier: m.user.kycTier,
        role: m.role,
        joinedAt: m.joinedAt,
      })),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ items: [] });
  }
}
