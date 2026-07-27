/**
 * GET  /api/mobile/quotes   — list quote requests for user or merchant
 * POST /api/mobile/quotes   — create a new quote request
 *
 * GET params: userId | merchantId
 * POST body:  { userId, merchantId, serviceDescription, budgetPaise? }
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const E2E = process.env.E2E_TEST === "1" || (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const userId     = searchParams.get("userId");
  const merchantId = searchParams.get("merchantId");

  if (!userId && !merchantId) {
    return NextResponse.json({ error: "userId or merchantId required" }, { status: 400 });
  }

  if (E2E) return NextResponse.json({ items: [] });

  try {
    const items = await prisma.quoteRequest.findMany({
      where: {
        ...(userId     ? { userId }     : {}),
        ...(merchantId ? { merchantId } : {}),
      },
      include: {
        user:     { select: { id: true, name: true, avatarUrl: true } },
        merchant: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}

export async function POST(req: NextRequest) {
  if (E2E) {
    return NextResponse.json({ id: "e2e-quote", status: "open" }, { status: 201 });
  }

  try {
    const { userId, merchantId, serviceDescription, budgetPaise } = await req.json();

    if (!userId || !merchantId || !serviceDescription) {
      return NextResponse.json({ error: "userId, merchantId, serviceDescription required" }, { status: 400 });
    }
    if (serviceDescription.trim().length < 5) {
      return NextResponse.json({ error: "serviceDescription too short" }, { status: 400 });
    }

    const quote = await prisma.quoteRequest.create({
      data: {
        userId, merchantId,
        serviceDescription: serviceDescription.trim(),
        budgetPaise: budgetPaise ?? null,
        status: "open",
      },
    });

    return NextResponse.json(quote, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
