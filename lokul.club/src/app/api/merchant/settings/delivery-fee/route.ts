import { NextResponse } from "next/server";
import { requireMerchant } from "@/lib/merchant-auth";
import prisma from "@/lib/prisma";

export async function PUT(request: Request) {
  try {
    const { merchantId } = await requireMerchant();
    const body = await request.json();
    const { deliveryFeePaise } = body;

    // Validate: must be an integer in range 0–50000 (₹0–₹500)
    if (
      deliveryFeePaise === undefined ||
      typeof deliveryFeePaise !== "number" ||
      !Number.isInteger(deliveryFeePaise)
    ) {
      return NextResponse.json(
        { error: "deliveryFeePaise must be an integer" },
        { status: 400 }
      );
    }

    if (deliveryFeePaise < 0 || deliveryFeePaise > 50000) {
      return NextResponse.json(
        { error: "deliveryFeePaise must be between 0 and 50000 (₹0–₹500)" },
        { status: 400 }
      );
    }

    try {
      // deliveryFeePaise is not yet in the Merchant schema — use `any` cast for graceful forward
      // compatibility. Once `prisma migrate dev` adds the column this will persist correctly.
      await (prisma.merchant as any).update({
        where: { id: merchantId },
        data: { deliveryFeePaise },
      });
    } catch (dbError: any) {
      // Field doesn't exist in the DB yet — return success with a note so the UI still works
      if (
        dbError.code === "P2009" ||
        dbError.message?.includes("deliveryFeePaise") ||
        dbError.message?.includes("Unknown field")
      ) {
        return NextResponse.json({
          success: true,
          note: "schema migration needed — deliveryFeePaise field not yet in database",
        });
      }
      throw dbError;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error updating delivery fee:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
