/**
 * GET  /api/mobile/posts  — list posts for a userId (my posts) or pinCode + type filter
 * POST /api/mobile/posts  — create a new post
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { moderateText } from "@/lib/moderation";
import { captureServerEvent } from "@/lib/analytics-server";
import { isFeatureEnabled } from "@/lib/feature-flags-server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const userId  = searchParams.get("userId");
  const pinCode = searchParams.get("pinCode");
  const type    = searchParams.get("type") ?? undefined;
  const cursor  = searchParams.get("cursor") ?? undefined;
  const limit   = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 50);

  if (!userId && !pinCode) {
    return NextResponse.json({ error: "userId or pinCode required" }, { status: 400 });
  }

  const where: Record<string, unknown> = {
    status: "active",
    deletedAt: null,
  };

  if (userId) where.authorId = userId;
  if (pinCode) where.pinCode = pinCode;
  if (type && type !== "all") where.type = type;

  try {
    const posts = await prisma.post.findMany({
      where,
      orderBy: [{ pinnedUntil: "desc" }, { createdAt: "desc" }],
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        author: { select: { id: true, name: true, avatarUrl: true, kycTier: true, trustScore: true } },
        media: { select: { kind: true, storageKey: true }, take: 4 },
        tags:  { select: { tag: true } },
        _count: { select: { reactions: true, comments: true } },
      },
    });

    const hasMore    = posts.length > limit;
    const items      = hasMore ? posts.slice(0, limit) : posts;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return NextResponse.json({
      items: items.map((p) => ({
        id:            p.id,
        type:          p.type,
        body:          p.body,
        pinned:        p.pinnedUntil != null && p.pinnedUntil > new Date(),
        createdAt:     p.createdAt,
        reactionCount: p._count.reactions,
        commentCount:  p._count.comments,
        author:        p.author,
        media:         p.media.map((m) => ({ kind: m.kind, url: m.storageKey })),
        tags:          p.tags.map((t) => t.tag),
      })),
      nextCursor,
      hasMore,
    });
  } catch {
    return NextResponse.json({ items: [], nextCursor: null, hasMore: false });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, type, postBody, visibility, pinCode, societyId, tags, media, lat, lng, meta, expiresAt } = body;

    if (!userId || !postBody?.trim() || !pinCode) {
      return NextResponse.json({ error: "userId, postBody, pinCode required" }, { status: 400 });
    }

    const VALID_TYPES = new Set(['update','safety','lost','event','poll','sell','rwa_notice','sos','recommendation','outage','help_request']);
    if (type && !VALID_TYPES.has(type)) {
      return NextResponse.json({ error: "Invalid post type" }, { status: 400 });
    }
    if (type === "sos" && !(await isFeatureEnabled("sos_broadcast", { pinCode, societyId, userId }))) {
      return NextResponse.json({ error: "SOS posts are currently disabled" }, { status: 403 });
    }
    if (type === "event" && !(await isFeatureEnabled("events", { pinCode, societyId, userId }))) {
      return NextResponse.json({ error: "Events are currently disabled" }, { status: 403 });
    }
    if (type === "lost" && !(await isFeatureEnabled("lost_found", { pinCode, societyId, userId }))) {
      return NextResponse.json({ error: "Lost & Found is currently disabled" }, { status: 403 });
    }

    // Moderation check
    const modResult = await moderateText(postBody);
    if (!modResult.ok) {
      return NextResponse.json({ error: modResult.reason ?? "Content not allowed." }, { status: 422 });
    }

    const mediaItems: { kind: string; storageKey: string }[] = Array.isArray(media)
      ? media
          .filter((m: unknown): m is string => typeof m === "string" && m.length > 0)
          .map((uri: string) => ({ kind: "image", storageKey: uri }))
      : [];

    const post = await prisma.post.create({
      data: {
        authorId:   userId,
        type:       type ?? "update",
        body:       postBody.trim(),
        visibility: visibility ?? "society",
        pinCode,
        societyId:  societyId ?? null,
        lat:        typeof lat === "number" ? lat : null,
        lng:        typeof lng === "number" ? lng : null,
        meta:       meta ?? undefined,
        expiresAt:  expiresAt ? new Date(expiresAt) : null,
        tags: tags?.length
          ? { create: (tags as string[]).map((tag: string) => ({ tag })) }
          : undefined,
        media: mediaItems.length
          ? { create: mediaItems.map((m, i) => ({ ...m, orderIndex: i })) }
          : undefined,
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true, kycTier: true } },
      },
    });

    // Funnel step 2/3: onboarding → first post → first order
    captureServerEvent(userId, "post_created", {
      postType: post.type,
      pinCode,
    });

    return NextResponse.json(post, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
