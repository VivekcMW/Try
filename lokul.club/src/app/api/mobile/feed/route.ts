/**
 * GET /api/mobile/feed — paginated feed posts filtered by pinCode + type
 * Query: pinCode, type?, cursor?, limit?
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const pinCode = searchParams.get("pinCode");
  const type    = searchParams.get("type") ?? undefined;
  const cursor  = searchParams.get("cursor") ?? undefined;
  const limit   = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 50);

  if (!pinCode) {
    return NextResponse.json({ error: "pinCode required" }, { status: 400 });
  }

  const where: Record<string, unknown> = {
    pinCode,
    status: "active",
    deletedAt: null,
  };

  const VALID_POST_TYPES = new Set(['update','safety','lost','event','poll','sell','rwa_notice','sos']);
  if (type && type !== 'all' && VALID_POST_TYPES.has(type)) {
    where.type = type;
  }

  const posts = await prisma.post.findMany({
    where,
    orderBy: [{ pinnedUntil: "desc" }, { createdAt: "desc" }],
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      author: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          kycTier: true,
          trustScore: true,
        },
      },
      media: { select: { kind: true, storageKey: true }, take: 4 },
      tags:  { select: { tag: true } },
      _count: { select: { reactions: true, comments: true } },
    },
  });

  const hasMore  = posts.length > limit;
  const items    = hasMore ? posts.slice(0, limit) : posts;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return NextResponse.json({
    posts: items.map((p) => ({
      id:           p.id,
      type:         p.type,
      body:         p.body,
      pinned:       p.pinnedUntil != null && p.pinnedUntil > new Date(),
      createdAt:    p.createdAt,
      reactionCount: p._count.reactions,
      commentCount:  p._count.comments,
      author: p.author,
      media:  p.media.map((m) => ({ kind: m.kind, url: m.storageKey })),
      tags:   p.tags.map((t) => t.tag),
    })),
    nextCursor,
    hasMore,
  });
}
