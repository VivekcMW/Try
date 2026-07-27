/**
 * GET  /api/mobile/borrow/requests?ownerId= — borrow requests on items owned by ownerId
 * POST /api/mobile/borrow/requests — request to borrow an item
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const ownerId = req.nextUrl.searchParams.get("ownerId");

  if (!ownerId) {
    return NextResponse.json({ error: "ownerId required" }, { status: 400 });
  }

  try {
    const requests = await prisma.borrowRequest.findMany({
      where: { item: { ownerId } },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        item: { select: { id: true, name: true } },
        requester: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ requests });
  } catch {
    return NextResponse.json({ error: "Failed to load requests" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { itemId, requesterId, duration } = await req.json();

    if (!itemId || !requesterId || !duration) {
      return NextResponse.json({ error: "itemId, requesterId, duration required" }, { status: 400 });
    }

    const item = await prisma.borrowItem.findUnique({ where: { id: itemId } });
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });
    if (!item.available) {
      return NextResponse.json({ error: "Item is currently unavailable" }, { status: 409 });
    }

    const request = await prisma.borrowRequest.create({
      data: { itemId, requesterId, duration },
      include: {
        item: { select: { id: true, name: true } },
        requester: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ request }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to send request" }, { status: 400 });
  }
}
