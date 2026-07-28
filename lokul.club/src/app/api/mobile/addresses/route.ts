/**
 * GET /api/mobile/addresses - Get all saved addresses for a user
 * POST /api/mobile/addresses - Create a new address
 */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const customerId = request.headers.get("x-user-id");
    if (!customerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const addresses = await prisma.userAddress.findMany({
      where: { userId: customerId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ],
    });

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const customerId = request.headers.get("x-user-id");
    if (!customerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      label,
      addressLine1,
      addressLine2,
      landmark,
      city,
      state,
      pinCode,
      lat,
      lng,
      isDefault,
    } = await request.json();

    if (!label || !addressLine1 || !city || !pinCode) {
      return NextResponse.json(
        { error: "label, addressLine1, city, and pinCode are required" },
        { status: 400 }
      );
    }

    // If this is being set as default, unset other defaults first
    if (isDefault) {
      await prisma.userAddress.updateMany({
        where: { userId: customerId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.userAddress.create({
      data: {
        userId: customerId,
        label,
        addressLine1,
        addressLine2,
        landmark,
        city,
        state,
        pinCode,
        lat,
        lng,
        isDefault: isDefault ?? false,
      },
    });

    return NextResponse.json(address, { status: 201 });
  } catch (error) {
    console.error("Error creating address:", error);
    return NextResponse.json({ error: "Failed to create address" }, { status: 500 });
  }
}
