/**
 * POST /api/mobile/vouch
 * Body: { voucherId: string; voucheeId: string }
 *
 * Rules:
 *  - voucher must be Silver or Gold tier
 *  - vouchee must be Bronze tier
 *  - max 5 vouches per voucher per calendar month
 *  - cannot vouch the same person twice
 *  - if vouchee reaches 3 vouches → auto-upgrade to Silver
 *
 * GET /api/mobile/vouch?pin=XXXXXX
 *  - returns Bronze users in the given PIN code (for the vouch discovery screen)
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MONTHLY_VOUCH_LIMIT = 5;
const VOUCHES_FOR_SILVER = 3;

const E2E = process.env.E2E_TEST === "1";

export async function GET(req: NextRequest) {
  const pin = req.nextUrl.searchParams.get("pin");
  const requesterId = req.nextUrl.searchParams.get("requesterId");

  if (!pin) {
    return NextResponse.json({ error: "pin is required" }, { status: 400 });
  }

  if (E2E) {
    return NextResponse.json([
      { id: "dev-bronze-1", name: "Ravi Sharma", avatarUrl: null, pin, alreadyVouched: false },
      { id: "dev-bronze-2", name: "Priya Patel", avatarUrl: null, pin, alreadyVouched: false },
    ]);
  }

  try {
    // Find Bronze users in this PIN code
    const users = await prisma.user.findMany({
      where: {
        kycTier: "bronze",
        localities: { some: { pinCode: pin, isPrimary: true } },
        ...(requesterId ? { id: { not: requesterId } } : {}),
      },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        vouchesReceived: requesterId
          ? { where: { voucherId: requesterId }, select: { id: true } }
          : false,
      },
      take: 20,
    });

    const result = users.map((u) => ({
      id: u.id,
      name: u.name,
      avatarUrl: u.avatarUrl,
      alreadyVouched: Array.isArray(u.vouchesReceived) && u.vouchesReceived.length > 0,
    }));

    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { voucherId, voucheeId } = body as {
      voucherId?: string;
      voucheeId?: string;
    };

    if (!voucherId || !voucheeId) {
      return NextResponse.json(
        { error: "voucherId and voucheeId are required" },
        { status: 400 }
      );
    }

    if (voucherId === voucheeId) {
      return NextResponse.json({ error: "Cannot vouch for yourself" }, { status: 400 });
    }

    if (E2E) {
      return NextResponse.json({ success: true, upgraded: false });
    }

    // Validate voucher tier (must be Silver or Gold)
    const voucher = await prisma.user.findUnique({
      where: { id: voucherId },
      select: { kycTier: true },
    });

    if (!voucher) {
      return NextResponse.json({ error: "Voucher not found" }, { status: 404 });
    }

    if (voucher.kycTier === "bronze") {
      return NextResponse.json(
        { error: "Only Silver or Gold members can vouch for others" },
        { status: 403 }
      );
    }

    // Validate vouchee is Bronze
    const vouchee = await prisma.user.findUnique({
      where: { id: voucheeId },
      select: { kycTier: true },
    });

    if (!vouchee) {
      return NextResponse.json({ error: "Vouchee not found" }, { status: 404 });
    }

    if (vouchee.kycTier !== "bronze") {
      return NextResponse.json(
        { error: "Can only vouch for Bronze-tier members" },
        { status: 400 }
      );
    }

    // Check monthly limit for voucher
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthlyCount = await prisma.vouch.count({
      where: {
        voucherId,
        createdAt: { gte: monthStart },
      },
    });

    if (monthlyCount >= MONTHLY_VOUCH_LIMIT) {
      return NextResponse.json(
        { error: `Monthly vouch limit of ${MONTHLY_VOUCH_LIMIT} reached` },
        { status: 429 }
      );
    }

    // Create vouch (unique constraint prevents duplicates)
    await prisma.vouch.create({ data: { voucherId, voucheeId } });

    // Check if vouchee qualifies for Silver auto-upgrade
    const totalVouches = await prisma.vouch.count({ where: { voucheeId } });
    let upgraded = false;

    if (totalVouches >= VOUCHES_FOR_SILVER) {
      await prisma.user.update({
        where: { id: voucheeId },
        data: { kycTier: "silver" },
      });
      upgraded = true;
    }

    return NextResponse.json({ success: true, upgraded });
  } catch (e: unknown) {
    // Unique constraint violation — already vouched
    if (
      typeof e === "object" &&
      e !== null &&
      "code" in e &&
      (e as { code: string }).code === "P2002"
    ) {
      return NextResponse.json({ error: "Already vouched for this user" }, { status: 409 });
    }
    console.error(e);
    return NextResponse.json({ error: "Failed to create vouch" }, { status: 500 });
  }
}
