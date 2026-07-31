import { NextRequest, NextResponse } from "next/server";
import { requireMerchant } from "@/lib/merchant-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { merchantId } = await requireMerchant();
    const status = request.nextUrl.searchParams.get("status") ?? "accepted";

    const statusFilter =
      status === "all" ? ["open", "quoted", "accepted", "declined"] : ["accepted"];

    const jobs = await prisma.quoteRequest.findMany({
      where: { merchantId, status: { in: statusFilter as any[] } },
      orderBy: { updatedAt: "desc" },
      include: {
        user: { select: { id: true, name: true, phone: true, avatarUrl: true } },
      },
    });

    return NextResponse.json({ jobs });
  } catch (error: any) {
    if (error?.message?.startsWith("Unauthorized"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
