/**
 * GET  /api/mobile/borrow/items — item directory for a pinCode (optionally filter by ownerId for "my listings")
 * POST /api/mobile/borrow/items — list a new item to lend
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const CONDITIONS = ["excellent", "good", "fair"];
const RENTAL_TYPES = ["free", "deposit", "rent"];

export async function GET(req: NextRequest) {
  const pinCode = req.nextUrl.searchParams.get("pinCode");
  const ownerId = req.nextUrl.searchParams.get("ownerId");

  if (!pinCode && !ownerId) {
    return NextResponse.json({ error: "pinCode or ownerId required" }, { status: 400 });
  }

  try {
    const items = await prisma.borrowItem.findMany({
      where: {
        ...(pinCode ? { pinCode } : {}),
        ...(ownerId ? { ownerId } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        owner: { select: { id: true, name: true } },
        requests: {
          where: { status: "approved" },
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { requester: { select: { id: true, name: true } } },
        },
      },
    });

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "Failed to load items" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      ownerId,
      name,
      category,
      description,
      condition,
      rentalType,
      depositAmountPaise,
      rentPerDayPaise,
      maxDays,
      pinCode,
    } = await req.json();

    if (!ownerId || !name || !category || !pinCode) {
      return NextResponse.json({ error: "ownerId, name, category, pinCode required" }, { status: 400 });
    }
    if (condition && !CONDITIONS.includes(condition)) {
      return NextResponse.json({ error: "invalid condition" }, { status: 400 });
    }
    if (rentalType && !RENTAL_TYPES.includes(rentalType)) {
      return NextResponse.json({ error: "invalid rentalType" }, { status: 400 });
    }

    const item = await prisma.borrowItem.create({
      data: {
        ownerId,
        name,
        category,
        description: description || "No description provided.",
        condition: condition ?? "good",
        rentalType: rentalType ?? "free",
        depositAmountPaise: rentalType === "free" ? null : depositAmountPaise ?? null,
        rentPerDayPaise: rentalType === "rent" ? rentPerDayPaise ?? null : null,
        maxDays: maxDays ?? 3,
        pinCode,
      },
      include: { owner: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to list item" }, { status: 400 });
  }
}
