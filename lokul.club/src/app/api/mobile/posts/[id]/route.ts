/**
 * GET /api/mobile/posts/[id]  — single post with comments
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const post = await prisma.post.findUnique({
      where: { id, deletedAt: null },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true, kycTier: true, trustScore: true } },
        media:  { select: { kind: true, storageKey: true }, orderBy: { orderIndex: "asc" } },
        tags:   { select: { tag: true } },
        _count: { select: { reactions: true, comments: true } },
      },
    });

    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({
      id:            post.id,
      type:          post.type,
      body:          post.body,
      pinned:        post.pinnedUntil != null && post.pinnedUntil > new Date(),
      createdAt:     post.createdAt,
      reactionCount: post._count.reactions,
      commentCount:  post._count.comments,
      author:        post.author,
      media:         post.media.map((m) => ({ kind: m.kind, url: m.storageKey })),
      tags:          post.tags.map((t) => t.tag),
    });
  } catch {
    return NextResponse.json({ error: "Failed to load post" }, { status: 500 });
  }
}
