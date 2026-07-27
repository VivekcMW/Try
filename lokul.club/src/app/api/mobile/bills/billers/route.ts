/**
 * GET  /api/mobile/bills/billers?ownerId= — a resident's saved billers
 *   (pass &category=&accountNumber= to find a specific match instead of the full list)
 * POST /api/mobile/bills/billers — save a biller
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const ownerId = req.nextUrl.searchParams.get("ownerId");
  const category = req.nextUrl.searchParams.get("category");
  const accountNumber = req.nextUrl.searchParams.get("accountNumber");
  if (!ownerId) return NextResponse.json({ error: "ownerId required" }, { status: 400 });

  try {
    if (category && accountNumber) {
      const biller = await prisma.savedBiller.findFirst({
        where: { ownerId, category, accountNumber: { equals: accountNumber, mode: "insensitive" } },
      });
      return NextResponse.json({ biller });
    }

    const billers = await prisma.savedBiller.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ billers });
  } catch {
    return NextResponse.json({ error: "Failed to load billers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { ownerId, category, provider, accountNumber, nickname, lastBillAmountPaise, pinCode } = await req.json();

    if (!ownerId || !category || !provider || !accountNumber || !pinCode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const biller = await prisma.savedBiller.create({
      data: {
        ownerId, category, provider, accountNumber,
        nickname: nickname || provider,
        lastBillAmountPaise: lastBillAmountPaise ?? null,
        pinCode,
      },
    });

    return NextResponse.json({ biller }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to save biller" }, { status: 400 });
  }
}
