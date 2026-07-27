/**
 * POST   /api/mobile/group-buys/[id]/commit  — commit to a group buy
 * DELETE /api/mobile/group-buys/[id]/commit  — withdraw commitment
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: groupBuyId } = await params;
  try {
    const { userId, quantity } = await req.json();
    if (!userId || !quantity) {
      return NextResponse.json({ error: "userId and quantity required" }, { status: 400 });
    }
    const gb = await prisma.groupBuy.findUnique({ where: { id: groupBuyId } });
    if (!gb) return NextResponse.json({ error: "GroupBuy not found" }, { status: 404 });
    if (gb.status !== "open") return NextResponse.json({ error: "Group buy no longer open" }, { status: 409 });
    if (new Date(gb.closesAt) < new Date()) {
      return NextResponse.json({ error: "Group buy has closed" }, { status: 409 });
    }

    const totalPaise = gb.pricePaise * quantity;

    const commit = await prisma.$transaction(async (tx) => {
      const c = await tx.groupBuyCommit.upsert({
        where: { groupBuyId_userId: { groupBuyId, userId } },
        update: { quantity, totalPaise, status: "committed" },
        create: { groupBuyId, userId, quantity, totalPaise, status: "committed" },
      });
      // Recompute currentQty
      const agg = await tx.groupBuyCommit.aggregate({
        where: { groupBuyId, status: { in: ["committed", "paid"] } },
        _sum: { quantity: true },
      });
      const newQty = agg._sum.quantity ?? 0;
      await tx.groupBuy.update({
        where: { id: groupBuyId },
        data: {
          currentQty: newQty,
          status: newQty >= gb.minQty ? "locked" : "open",
        },
      });
      return c;
    });
    return NextResponse.json(commit, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: groupBuyId } = await params;
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const gb = await prisma.groupBuy.findUnique({ where: { id: groupBuyId } });
    if (gb?.status === "locked") {
      return NextResponse.json({ error: "Cannot withdraw after buy is locked" }, { status: 409 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.groupBuyCommit.updateMany({
        where: { groupBuyId, userId },
        data: { status: "withdrawn" },
      });
      const agg = await tx.groupBuyCommit.aggregate({
        where: { groupBuyId, status: { in: ["committed", "paid"] } },
        _sum: { quantity: true },
      });
      await tx.groupBuy.update({
        where: { id: groupBuyId },
        data: { currentQty: agg._sum.quantity ?? 0 },
      });
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
