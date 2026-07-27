/**
 * GET /api/mobile/broadcasts  — fetch sent broadcasts for a user
 *
 * Query params:
 *   userId   — used to match targetScope (optional; falls back to "all" broadcasts)
 *   pinCode  — user's pincode for scope matching
 *   city     — user's city for scope matching
 *   limit    — max results (default 10, max 30)
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const userId  = searchParams.get("userId");
  const pinCode = searchParams.get("pinCode");
  const city    = searchParams.get("city");
  const limit   = Math.min(30, Number.parseInt(searchParams.get("limit") ?? "10", 10));

  // Build scope filters: a broadcast is relevant if it targets "all",
  // or matches the user's city / pincode / userId
  const scopeValues: string[] = ["all"];
  if (city)    scopeValues.push(`city:${city}`);
  if (pinCode) scopeValues.push(`pincode:${pinCode}`);
  if (userId)  scopeValues.push(`user:${userId}`);

  try {
    const items = await prisma.broadcast.findMany({
      where: {
        status: "sent",
        sentAt: { not: null },
        targetScope: { in: scopeValues },
      },
      orderBy: { sentAt: "desc" },
      take: limit,
      select: {
        id: true,
        title: true,
        body: true,
        targetScope: true,
        sentAt: true,
      },
    });

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "Failed to load broadcasts" }, { status: 500 });
  }
}
