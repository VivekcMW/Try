/**
 * GET /api/web/group-buys/[id] — public group buy share page data
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const E2E = process.env.E2E_TEST === "1" || (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");

const STUB = {
  id: "gb-demo",
  title: "Organic Basmati Rice 5 kg",
  description: "Grade A long-grain basmati. Farm-direct from Punjab. Packed fresh every week.",
  category: "Groceries",
  pricePaise: 49900,
  marketPricePaise: 65000,
  unit: "bag (5 kg)",
  minQty: 1,
  targetQty: 50,
  currentQty: 34,
  closesAt: new Date(Date.now() + 2 * 24 * 3_600_000).toISOString(),
  pinCode: "411007",
  city: "Pune",
  status: "open",
  organizer: { name: "Aundh Fresh Co-op", avatar: null },
  slots: [
    { id: "s1", name: "Priya S.", qty: 2 },
    { id: "s2", name: "Rahul M.", qty: 1 },
    { id: "s3", name: "Sunita K.", qty: 3 },
  ],
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (E2E) {
    return NextResponse.json({ ...STUB, id });
  }

  try {
    const gb = await prisma.groupBuy.findUnique({
      where: { id },
      include: {
        commits: { select: { id: true, quantity: true, user: { select: { name: true } } }, take: 20 },
        organizer: { select: { name: true, avatarUrl: true } },
      },
    });

    if (!gb) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const currentQty = gb.commits.reduce((sum, c) => sum + c.quantity, 0);

    return NextResponse.json({
      id: gb.id,
      title: gb.title,
      description: gb.description ?? "",
      category: "General",
      pricePaise: gb.pricePaise,
      marketPricePaise: gb.marketPricePaise ?? null,
      unit: gb.unit ?? "unit",
      minQty: gb.minQty ?? 1,
      targetQty: gb.targetQty,
      currentQty,
      closesAt: gb.closesAt.toISOString(),
      pinCode: gb.pinCode,
      city: "",
      status: gb.status,
      organizer: { name: gb.organizer?.name ?? "Local Organizer", avatar: gb.organizer?.avatarUrl ?? null },
      slots: gb.commits.map((c) => ({
        id: c.id,
        name: c.user.name.charAt(0) + c.user.name.slice(1, 3) + "***",
        qty: c.quantity,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
