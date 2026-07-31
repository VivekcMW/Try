import { NextResponse } from "next/server";
import { requireMerchant } from "@/lib/merchant-auth";
import prisma from "@/lib/prisma";

export async function PUT(request: Request) {
  try {
    const { merchantId } = await requireMerchant();
    const body = await request.json();
    const { name, description, avatarUrl } = body;

    // Validate name if provided
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json(
          { error: "name must be a non-empty string" },
          { status: 400 }
        );
      }
      if (name.trim().length > 100) {
        return NextResponse.json(
          { error: "name must be 100 characters or fewer" },
          { status: 400 }
        );
      }
    }

    // Build update data — only include fields that were provided
    const data: { name?: string; description?: string | null; avatarUrl?: string | null } = {};
    if (name !== undefined) data.name = name.trim();
    if (description !== undefined) data.description = description || null;
    if (avatarUrl !== undefined) data.avatarUrl = avatarUrl || null;

    const updated = await prisma.merchant.update({
      where: { id: merchantId },
      data,
      select: { name: true, description: true, avatarUrl: true },
    });

    return NextResponse.json({ success: true, merchant: updated });
  } catch (error: any) {
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error updating merchant profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
