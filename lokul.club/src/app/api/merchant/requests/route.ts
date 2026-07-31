import { NextRequest, NextResponse } from "next/server";
import { requireMerchant } from "@/lib/merchant-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { merchantId } = await requireMerchant();
    const filter = request.nextUrl.searchParams.get("filter") ?? "open";

    const statusMap: Record<string, string[]> = {
      open: ["open"],
      quoted: ["quoted"],
      accepted: ["accepted"],
      declined: ["declined"],
      active: ["open", "quoted"],
      all: ["open", "quoted", "accepted", "declined"],
    };

    const statuses = statusMap[filter] ?? ["open"];

    const requests = await prisma.quoteRequest.findMany({
      where: { merchantId, status: { in: statuses as any[] } },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, phone: true, avatarUrl: true } },
      },
    });

    return NextResponse.json({ requests });
  } catch (error: any) {
    if (error?.message?.startsWith("Unauthorized"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
