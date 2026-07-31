/**
 * PATCH  /api/merchant/branches/[id] — update branch fields or toggle isActive
 * DELETE /api/merchant/branches/[id] — delete a branch
 */
import { NextRequest, NextResponse } from "next/server";
import { requireMerchant } from "@/lib/merchant-auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { merchantId } = await requireMerchant();
    const { id } = await params;

    const branch = await prisma.merchantBranch.findUnique({ where: { id } });

    if (!branch) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }
    if (branch.merchantId !== merchantId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, address, pinCode, city, lat, lng, phone, isActive } = body as {
      name?: string;
      address?: string;
      pinCode?: string;
      city?: string;
      lat?: number | null;
      lng?: number | null;
      phone?: string | null;
      isActive?: boolean;
    };

    const updated = await prisma.merchantBranch.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(address !== undefined && { address: address.trim() }),
        ...(pinCode !== undefined && { pinCode: pinCode.trim() }),
        ...(city !== undefined && { city: city.trim() }),
        ...(lat !== undefined && { lat }),
        ...(lng !== undefined && { lng }),
        ...(phone !== undefined && { phone: phone?.trim() || null }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ branch: updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update branch" },
      { status: err.message?.startsWith("Unauthorized") ? 401 : 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { merchantId } = await requireMerchant();
    const { id } = await params;

    const branch = await prisma.merchantBranch.findUnique({ where: { id } });

    if (!branch) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }
    if (branch.merchantId !== merchantId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.merchantBranch.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete branch" },
      { status: err.message?.startsWith("Unauthorized") ? 401 : 500 }
    );
  }
}
