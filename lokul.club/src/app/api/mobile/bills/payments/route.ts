/**
 * GET  /api/mobile/bills/payments?ownerId= — a resident's payment history
 * POST /api/mobile/bills/payments — pay a bill (debits the wallet atomically)
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const ownerId = req.nextUrl.searchParams.get("ownerId");
  if (!ownerId) return NextResponse.json({ error: "ownerId required" }, { status: 400 });

  try {
    const payments = await prisma.billPayment.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json({ payments });
  } catch {
    return NextResponse.json({ error: "Failed to load payments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { ownerId, billerId, biller, provider, amountPaise } = await req.json();

    if (!ownerId || !biller || !provider || !amountPaise || amountPaise <= 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: ownerId }, select: { walletBalancePaise: true } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (user.walletBalancePaise < amountPaise) {
      return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 422 });
    }

    const cashbackPaise = Math.floor(amountPaise * 0.02);

    const payment = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: ownerId },
        data: { walletBalancePaise: { decrement: amountPaise } },
      });
      await tx.walletEntry.create({
        data: {
          userId: ownerId,
          type: "spend",
          amountPaise: -amountPaise,
          description: `Bill payment: ${provider}`,
          status: "completed",
        },
      });

      if (cashbackPaise > 0) {
        await tx.user.update({
          where: { id: ownerId },
          data: { walletBalancePaise: { increment: cashbackPaise } },
        });
        await tx.walletEntry.create({
          data: {
            userId: ownerId,
            type: "earn",
            amountPaise: cashbackPaise,
            description: `Cashback: ${provider}`,
            status: "completed",
          },
        });
      }

      if (billerId) {
        await tx.savedBiller.update({ where: { id: billerId }, data: { status: "paid" } });
      }

      return tx.billPayment.create({
        data: { ownerId, billerId: billerId || null, biller, provider, amountPaise },
      });
    });

    return NextResponse.json({ payment, cashbackPaise }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to process payment" }, { status: 400 });
  }
}
