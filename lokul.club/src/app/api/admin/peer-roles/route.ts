/**
 * GET   /api/admin/peer-roles   — list peer service listings for moderation
 * PATCH /api/admin/peer-roles   — activate or suspend a listing
 */
import { getServerUser } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const user = await getServerUser();
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const status   = searchParams.get("status");
  const category = searchParams.get("category");
  const pinCode  = searchParams.get("pinCode");
  const limit    = Math.min(100, parseInt(searchParams.get("limit") ?? "50", 10));
  const skip     = parseInt(searchParams.get("skip") ?? "0", 10);

  try {
    const listings = await prisma.serviceListing.findMany({
      where: {
        ...(status   ? { isActive: status === "active" } : {}),
        ...(category ? { category: { equals: category as never } } : {}),
        ...(pinCode  ? { pinCode } : {}),
      },
      include: {
        user: { select: { id: true, name: true, phone: true, kycTier: true, createdAt: true } },
        _count: { select: { orders: true, ratings: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });
    const total = await prisma.serviceListing.count({
      where: {
        ...(status   ? { isActive: status === "active" } : {}),
        ...(category ? { category: { equals: category as never } } : {}),
        ...(pinCode  ? { pinCode } : {}),
      },
    });
    return NextResponse.json({ items: listings, total });
  } catch {
    return NextResponse.json({ items: [], total: 0 });
  }
}

export async function PATCH(req: NextRequest) {
  const user = await getServerUser();
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { listingId, action } = await req.json();
    if (!listingId || !action) {
      return NextResponse.json({ error: "listingId and action required" }, { status: 400 });
    }
    if (!["activate", "suspend"].includes(action)) {
      return NextResponse.json({ error: "action must be activate or suspend" }, { status: 400 });
    }
    const listing = await prisma.serviceListing.update({
      where: { id: listingId },
      data: { isActive: action === "activate" },
    });
    return NextResponse.json(listing);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
