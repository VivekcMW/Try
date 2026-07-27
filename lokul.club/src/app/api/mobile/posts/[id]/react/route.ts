/**
 * POST   /api/mobile/posts/[id]/react  — toggle reaction (like/love/thanks/support/concern)
 * DELETE /api/mobile/posts/[id]/react  — remove reaction
 * GET    /api/mobile/posts/[id]/react  — get reaction counts + viewer's own kind
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VALID_KINDS = ["like", "love", "thanks", "support", "concern"] as const;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params;
  const userId = req.nextUrl.searchParams.get("userId");

  try {
    const counts = await prisma.reaction.groupBy({
      by: ["kind"],
      where: { postId },
      _count: { kind: true },
    });

    const ownReaction = userId
      ? await prisma.reaction.findUnique({ where: { postId_userId: { postId, userId } } })
      : null;

    return NextResponse.json({
      counts: Object.fromEntries(counts.map((c) => [c.kind, c._count.kind])),
      total:  counts.reduce((s, c) => s + c._count.kind, 0),
      own:    ownReaction?.kind ?? null,
    });
  } catch {
    return NextResponse.json({ counts: {}, total: 0, own: null });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params;
  try {
    const { userId, kind = "like" } = await req.json();
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
    if (!VALID_KINDS.includes(kind)) {
      return NextResponse.json({ error: "invalid kind" }, { status: 400 });
    }

    const reaction = await prisma.reaction.upsert({
      where:  { postId_userId: { postId, userId } },
      update: { kind },
      create: { postId, userId, kind },
    });

    return NextResponse.json(reaction, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params;
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    await prisma.reaction.deleteMany({ where: { postId, userId } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
