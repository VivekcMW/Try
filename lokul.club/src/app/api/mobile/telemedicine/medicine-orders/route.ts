/**
 * POST /api/mobile/telemedicine/medicine-orders — place a medicine order
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId, items } = await req.json();

    if (!userId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "userId and items required" }, { status: 400 });
    }

    const totalPaise = items.reduce((sum: number, i: { pricePaise: number; qty: number }) => sum + i.pricePaise * i.qty, 0);

    const order = await prisma.telemedMedicineOrder.create({
      data: { userId, items, totalPaise },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to place order" }, { status: 400 });
  }
}
