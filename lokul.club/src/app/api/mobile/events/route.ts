/**
 * GET  /api/mobile/events  — list events by pinCode (posts of type=event)
 * POST /api/mobile/events  — create a new event post
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const pinCode = searchParams.get("pinCode");
  const limit   = Math.min(50, parseInt(searchParams.get("limit") ?? "20", 10));
  const cursor  = searchParams.get("cursor") ?? undefined;

  if (!pinCode) return NextResponse.json({ error: "pinCode required" }, { status: 400 });

  try {
    const posts = await prisma.post.findMany({
      where: { pinCode, type: "event", deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        tags:   { select: { tag: true } },
        _count: { select: { reactions: true, comments: true } },
      },
    });

    const hasMore = posts.length > limit;
    const items   = hasMore ? posts.slice(0, limit) : posts;

    return NextResponse.json({
      items: items.map((p) => ({
        id:           p.id,
        type:         p.type,
        body:         p.body,
        createdAt:    p.createdAt,
        tags:         p.tags.map((t) => t.tag),
        author:       p.author,
        reactionCount: p._count.reactions,
        commentCount:  p._count.comments,
      })),
      nextCursor: hasMore ? items[items.length - 1].id : null,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load events" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      authorId,
      pinCode,
      title,
      description,
      venue,
      eventDate,
      tags,
    } = await req.json();

    if (!authorId || !pinCode || !title) {
      return NextResponse.json({ error: "authorId, pinCode, title required" }, { status: 400 });
    }

    const body = [
      title,
      description ? `\n${description}` : "",
      venue ? `\n📍 ${venue}` : "",
      eventDate ? `\n🗓 ${new Date(eventDate).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}` : "",
    ]
      .filter(Boolean)
      .join("");

    const post = await prisma.post.create({
      data: {
        authorId,
        pinCode,
        type:   "event",
        body,
        tags:   { create: (tags ?? []).map((t: string) => ({ tag: t.trim().toLowerCase() })) },
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        tags:   { select: { tag: true } },
      },
    });

    return NextResponse.json(
      {
        id:        post.id,
        type:      post.type,
        body:      post.body,
        createdAt: post.createdAt,
        tags:      post.tags.map((t) => t.tag),
        author:    post.author,
      },
      { status: 201 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
