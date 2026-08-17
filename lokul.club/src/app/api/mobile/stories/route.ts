/**
 * GET  /api/mobile/stories   — list active stories for a pinCode / societyId
 * POST /api/mobile/stories   — create a new story
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isFeatureEnabled } from "@/lib/feature-flags-server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const pinCode   = searchParams.get("pinCode");
  const viewerId  = searchParams.get("viewerId") ?? undefined;

  if (!pinCode) return NextResponse.json({ error: "pinCode required" }, { status: 400 });

  try {
    const stories = await prisma.story.findMany({
      where: { pinCode, expiresAt: { gte: new Date() } },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true, kycTier: true } },
        views:  viewerId ? { where: { viewerId }, select: { viewedAt: true } } : false,
      },
      orderBy: { createdAt: "desc" },
      take: 40,
    });
    return NextResponse.json({ items: stories });
  } catch {
    return NextResponse.json({ items: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { authorId, mediaKey, kind, caption, pinCode, societyId } = await req.json();

    if (!(await isFeatureEnabled("stories", { pinCode, societyId, userId: authorId }))) {
      return NextResponse.json({ error: "Stories are currently disabled" }, { status: 403 });
    }

    if (!authorId || !mediaKey || !pinCode) {
      return NextResponse.json({ error: "authorId, mediaKey, pinCode required" }, { status: 400 });
    }
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // +24h
    const story = await prisma.story.create({
      data: { authorId, mediaKey, kind: kind ?? "image", caption, pinCode, societyId, expiresAt },
    });
    return NextResponse.json(story, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
