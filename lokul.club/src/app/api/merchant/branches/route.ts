/**
 * GET  /api/merchant/branches — list all branches for this merchant
 * POST /api/merchant/branches — create a new branch
 */
import { NextRequest, NextResponse } from "next/server";
import { requireMerchant } from "@/lib/merchant-auth";
import { prisma } from "@/lib/prisma";
import { isFeatureEnabled } from "@/lib/feature-flags-server";

export async function GET(_req: NextRequest) {
  try {
    const { merchantId } = await requireMerchant();

    const branches = await prisma.merchantBranch.findMany({
      where: { merchantId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ branches });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch branches" },
      { status: err.message?.startsWith("Unauthorized") ? 401 : 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { merchantId, merchant, userId } = await requireMerchant();
    if (!(await isFeatureEnabled("merchant_branches", { pinCode: merchant.pinCode, city: merchant.city, userId }))) {
      return NextResponse.json({ error: "Branches are currently disabled" }, { status: 403 });
    }

    const body = await req.json();

    const { name, address, pinCode, city, lat, lng, phone } = body as {
      name: string;
      address: string;
      pinCode: string;
      city: string;
      lat?: number;
      lng?: number;
      phone?: string;
    };

    // Validate required fields
    if (!name?.trim()) {
      return NextResponse.json({ error: "Branch name is required" }, { status: 400 });
    }
    if (!address?.trim()) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }
    if (!pinCode?.trim()) {
      return NextResponse.json({ error: "Pin code is required" }, { status: 400 });
    }
    if (!city?.trim()) {
      return NextResponse.json({ error: "City is required" }, { status: 400 });
    }

    const branch = await prisma.merchantBranch.create({
      data: {
        merchantId,
        name: name.trim(),
        address: address.trim(),
        pinCode: pinCode.trim(),
        city: city.trim(),
        lat: lat ?? null,
        lng: lng ?? null,
        phone: phone?.trim() || null,
      },
    });

    return NextResponse.json({ branch }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create branch" },
      { status: err.message?.startsWith("Unauthorized") ? 401 : 500 }
    );
  }
}
