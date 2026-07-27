/**
 * GET /api/mobile/search  — unified search across posts, merchants, users, communities, classifieds
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q       = (searchParams.get("q") ?? "").trim();
  const pinCode = searchParams.get("pinCode");
  const limit   = Math.min(30, parseInt(searchParams.get("limit") ?? "10", 10));

  if (!q || q.length < 2) return NextResponse.json({ results: [] });
  if (!pinCode) return NextResponse.json({ error: "pinCode required" }, { status: 400 });

  const likeTerm = `%${q}%`;

  try {
    const [merchants, communities, listings] = await Promise.all([
      // Merchants / businesses
      prisma.merchant.findMany({
        where: {
          pinCode,
          status: "active",
          OR: [
            { name:        { contains: q, mode: "insensitive" } },
            { category:    { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        },
        select: { id: true, name: true, category: true, avatarUrl: true, ratingAvg: true, ratingCount: true },
        take: limit,
      }),
      // Communities
      prisma.community.findMany({
        where: {
          pinCode,
          isActive: true,
          OR: [
            { name:        { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        },
        select: { id: true, name: true, type: true, memberCount: true, coverUrl: true },
        take: limit,
      }),
      // Peer service listings
      prisma.serviceListing.findMany({
        where: {
          pinCode,
          isActive: true,
          OR: [
            { title:       { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        },
        include: { user: { select: { id: true, name: true, avatarUrl: true, kycTier: true } } },
        take: limit,
      }),
    ]);

    return NextResponse.json({
      results: {
        merchants:   merchants.map((m) => ({ kind: "merchant",   ...m })),
        communities: communities.map((c) => ({ kind: "community", ...c })),
        listings:    listings.map((l) => ({ kind: "listing",    ...l })),
      },
    });
  } catch {
    return NextResponse.json({ results: { merchants: [], communities: [], listings: [] } });
  }
}
