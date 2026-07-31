/**
 * GET /api/web/ads/societies/search?q=<name>
 *
 * Lightweight autocomplete for the /advertise audience picker — lets a
 * self-serve advertiser target specific approved societies by name without
 * needing to know internal IDs.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (q.length < 2) return NextResponse.json({ items: [] });

  const societies = await prisma.society.findMany({
    where: { name: { contains: q, mode: "insensitive" }, status: "approved" },
    select: { id: true, name: true, pinCode: true, city: true },
    orderBy: { name: "asc" },
    take: 10,
  });

  return NextResponse.json({ items: societies });
}
