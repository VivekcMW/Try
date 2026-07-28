/**
 * PUT /api/mobile/addresses/[id] - Update an address
 * DELETE /api/mobile/addresses/[id] - Delete an address
 */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Check ownership
    const existing = await prisma.userAddress.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== customerId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // If setting as default, unset other defaults first
    if (isDefault && !existing.isDefault) {
      await prisma.userAddress.updateMany({
        where: { userId: customerId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.userAddress.update({
      where: { id },
      data: {
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
      },
    });

    return NextResponse.json(address);
  } catch (error) {
    console.error("Error updating address:", error);
    return NextResponse.json({ error: "Failed to update address" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customerId = request.headers.get("x-user-id");
    
    if (!customerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check ownership
    const existing = await prisma.userAddress.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== customerId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.userAddress.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting address:", error);
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 });
  }
}
