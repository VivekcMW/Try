import { NextRequest, NextResponse } from "next/server";
import { requireMerchant } from "@/lib/merchant-auth";
import { prisma } from "@/lib/prisma";
import { hasRealDatabaseConfig } from "@/lib/data-source-guard";

export async function GET(request: NextRequest) {
  if (!hasRealDatabaseConfig()) {
    return NextResponse.json({ appointments: [], warning: "No live database configured" }, { status: 503 });
  }

  const { merchantId } = await requireMerchant();
  const filter = request.nextUrl.searchParams.get("filter") ?? "upcoming";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  let whereExtra: object = {};
  if (filter === "today") whereExtra = { scheduledAt: { gte: today, lt: tomorrow } };
  else if (filter === "upcoming") whereExtra = { scheduledAt: { gte: tomorrow }, status: { in: ["pending", "confirmed"] } };
  else if (filter === "past") whereExtra = { scheduledAt: { lt: today } };
  else if (filter === "cancelled") whereExtra = { status: "cancelled" };

  const appointments = await prisma.appointment.findMany({
    where: { merchantId, ...whereExtra },
    orderBy: { scheduledAt: "asc" },
    include: {
      user: { select: { id: true, name: true, phone: true, avatarUrl: true } },
      slot: { select: { date: true, startTime: true, endTime: true } },
    },
  });

  return NextResponse.json({ appointments });
}
