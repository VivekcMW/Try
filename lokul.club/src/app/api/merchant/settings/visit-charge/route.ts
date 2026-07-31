/**
 * GET  /api/merchant/settings/visit-charge — return current visitChargePaise
 * PUT  /api/merchant/settings/visit-charge — save visitChargePaise
 *
 * Stored inside the notifPrefs JSON field as { ...otherPrefs, visitChargePaise: number }
 */
import { NextRequest, NextResponse } from "next/server";
import { requireMerchant } from "@/lib/merchant-auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest) {
  try {
    const { merchant } = await requireMerchant();

    const data = await prisma.merchant.findUnique({
      where: { id: merchant.id },
      select: { notifPrefs: true },
    });

    const prefs = (data?.notifPrefs ?? {}) as Record<string, unknown>;
    const visitChargePaise = typeof prefs.visitChargePaise === "number" ? prefs.visitChargePaise : null;

    return NextResponse.json({ visitChargePaise });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch visit charge" },
      { status: err.message?.startsWith("Unauthorized") ? 401 : 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { merchant } = await requireMerchant();
    const { visitChargePaise } = await req.json();

    if (typeof visitChargePaise !== "number" || visitChargePaise < 0) {
      return NextResponse.json(
        { error: "visitChargePaise must be a non-negative number" },
        { status: 400 }
      );
    }

    // Read existing prefs and merge
    const existing = await prisma.merchant.findUnique({
      where: { id: merchant.id },
      select: { notifPrefs: true },
    });

    const currentPrefs = (existing?.notifPrefs ?? {}) as Record<string, unknown>;
    const newPrefs = { ...currentPrefs, visitChargePaise };

    await prisma.merchant.update({
      where: { id: merchant.id },
      data: { notifPrefs: newPrefs },
    });

    return NextResponse.json({ success: true, visitChargePaise });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to save visit charge" },
      { status: err.message?.startsWith("Unauthorized") ? 401 : 500 }
    );
  }
}
