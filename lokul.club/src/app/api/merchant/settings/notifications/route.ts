/**
 * GET  /api/merchant/settings/notifications — return current notifPrefs (or defaults)
 * PUT  /api/merchant/settings/notifications — save notifPrefs
 */
import { NextRequest, NextResponse } from "next/server";
import { requireMerchant } from "@/lib/merchant-auth";
import { prisma } from "@/lib/prisma";

const DEFAULTS = { newOrder: true, orderUpdates: true, lowStock: true };

export async function GET(_req: NextRequest) {
  try {
    const { merchant } = await requireMerchant();

    const data = await prisma.merchant.findUnique({
      where: { id: merchant.id },
      select: { notifPrefs: true },
    });

    const prefs = (data?.notifPrefs as typeof DEFAULTS | null) ?? DEFAULTS;

    return NextResponse.json({ ...DEFAULTS, ...prefs });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch notification preferences" },
      { status: err.message?.startsWith("Unauthorized") ? 401 : 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { merchant } = await requireMerchant();
    const body = await req.json();

    const { newOrder, orderUpdates, lowStock } = body as {
      newOrder: boolean;
      orderUpdates: boolean;
      lowStock: boolean;
    };

    if (
      typeof newOrder !== "boolean" ||
      typeof orderUpdates !== "boolean" ||
      typeof lowStock !== "boolean"
    ) {
      return NextResponse.json(
        { error: "All preference fields must be booleans" },
        { status: 400 }
      );
    }

    await prisma.merchant.update({
      where: { id: merchant.id },
      data: { notifPrefs: { newOrder, orderUpdates, lowStock } },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to save notification preferences" },
      { status: err.message?.startsWith("Unauthorized") ? 401 : 500 }
    );
  }
}
