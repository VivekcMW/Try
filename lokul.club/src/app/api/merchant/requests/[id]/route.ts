import { NextRequest, NextResponse } from "next/server";
import { requireMerchant } from "@/lib/merchant-auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { merchantId } = await requireMerchant();
    const { id } = await params;

    const req = await prisma.quoteRequest.findFirst({
      where: { id, merchantId },
      include: {
        user: { select: { id: true, name: true, phone: true, avatarUrl: true } },
      },
    });

    if (!req) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ request: req });
  } catch (error: any) {
    if (error?.message?.startsWith("Unauthorized"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
