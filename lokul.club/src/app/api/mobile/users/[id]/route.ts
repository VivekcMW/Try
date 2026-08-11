/**
 * GET   /api/mobile/users/[id]  — public user profile
 * PATCH /api/mobile/users/[id]  — update own profile (requires the caller's
 *                                  bearer token to match the path id)
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMobileAuth } from "@/lib/mobile-auth";
import { AgeBand } from "@/generated/prisma/enums";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const user = await prisma.user.findUnique({
      where: { id, status: "active" },
      select: {
        id: true, name: true, avatarUrl: true, bio: true,
        kycTier: true, trustScore: true, role: true, createdAt: true,
        _count: {
          select: { posts: true, ordersGiven: true, ordersReceived: true },
        },
        serviceListing: {
          select: {
            id: true, category: true, title: true, description: true,
            pricePaise: true, priceUnit: true, ratingAvg: true, ratingCount: true,
          },
        },
      },
    });

    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Failed to load user" }, { status: 500 });
  }
}

const AGE_BANDS = Object.values(AgeBand);

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const authedUserId = requireMobileAuth(req);
  if (!authedUserId || authedUserId !== id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, bio, avatarUrl, language, privacy, ageBand, radiusKm } = body;

    if (name !== undefined && name.trim().length < 2) {
      return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 });
    }
    if (ageBand !== undefined && ageBand !== null && !AGE_BANDS.includes(ageBand)) {
      return NextResponse.json({ error: "Invalid ageBand" }, { status: 400 });
    }
    if (radiusKm !== undefined && radiusKm !== null && (typeof radiusKm !== "number" || radiusKm <= 0 || radiusKm > 50)) {
      return NextResponse.json({ error: "radiusKm must be between 0 and 50" }, { status: 400 });
    }

    const data: Record<string, unknown> = {};
    if (name      !== undefined) { data['name']            = name.trim(); }
    if (bio       !== undefined) { data['bio']             = bio?.trim() ?? null; }
    if (avatarUrl !== undefined) { data['avatarUrl']       = avatarUrl; }
    if (language  !== undefined) { data['language']        = language; }
    if (privacy   !== undefined) { data['privacySettings'] = privacy; }
    if (ageBand   !== undefined) { data['ageBand']          = ageBand; } // self-declared, optional — never required
    if (radiusKm  !== undefined) { data['radiusKm']         = radiusKm; }

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, avatarUrl: true, bio: true, kycTier: true, role: true, privacySettings: true, ageBand: true, radiusKm: true },
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
