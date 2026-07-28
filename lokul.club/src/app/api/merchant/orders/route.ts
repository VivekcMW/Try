/**
 * GET  /api/merchant/orders — list orders for the authenticated merchant
 * Query params: status, search, page, limit, from_date, to_date
 */
import { NextRequest, NextResponse } from "next/server";
import { requireMerchant } from "@/lib/merchant-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { merchant } = await requireMerchant();
    const { searchParams } = req.nextUrl;
    
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "20", 10));
    const fromDate = searchParams.get("from_date") || undefined;
    const toDate = searchParams.get("to_date") || undefined;

    // Build where clause
    const where: any = {
      merchantId: merchant.id,
    };

    if (status && status !== "all") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { customer: { name: { contains: search, mode: "insensitive" } } },
        { customer: { phone: { contains: search } } },
      ];
    }

    if (fromDate) {
      where.createdAt = { ...where.createdAt, gte: new Date(fromDate) };
    }

    if (toDate) {
      where.createdAt = { ...where.createdAt, lte: new Date(toDate) };
    }

    // Get orders
    const [orders, total] = await Promise.all([
      prisma.merchantOrder.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
              avatarUrl: true,
              kycTier: true,
            },
          },
          orderItems: {
            include: {
              catalogItem: {
                select: { id: true, name: true, imageUrl: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.merchantOrder.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    if (error.message === "Not authenticated" || error.message?.includes("suspended")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Failed to fetch orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
