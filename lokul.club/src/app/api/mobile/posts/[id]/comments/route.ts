/**
 * GET  /api/mobile/posts/[id]/comments  — list comments
 * POST /api/mobile/posts/[id]/comments  — add a comment
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params;
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") ?? "30", 10), 100);

  try {
    const comments = await prisma.comment.findMany({
      where: { postId, status: "active", deletedAt: null, parentId: null },
      orderBy: { createdAt: "asc" },
      take: limit,
      include: {
        author: { select: { id: true, name: true, avatarUrl: true, kycTier: true } },
        recommendedMerchant: { select: { id: true, name: true, category: true, ratingAvg: true, ratingCount: true } },
        replies: {
          where: { status: "active", deletedAt: null },
          orderBy: { createdAt: "asc" },
          include: { author: { select: { id: true, name: true, avatarUrl: true, kycTier: true } } },
        },
      },
    });

    return NextResponse.json({ items: comments });
  } catch {
    return NextResponse.json({ items: [] });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params;

  try {
    const body = await req.json();
    const { userId, text, parentId, recommendedMerchantId } = body;

    if (!userId || !text?.trim()) {
      return NextResponse.json({ error: "userId and text required" }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        authorId: userId,
        body:     text.trim(),
        parentId: parentId ?? null,
        recommendedMerchantId: recommendedMerchantId ?? null,
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true, kycTier: true } },
        recommendedMerchant: { select: { id: true, name: true, category: true, ratingAvg: true, ratingCount: true } },
      },
    });

    // Update denormalised count
    await prisma.post.update({
      where: { id: postId },
      data:  { commentCount: { increment: 1 } },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
  }
}
