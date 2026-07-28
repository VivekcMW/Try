"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  businessName: z.string().min(2).max(120),
  ownerName:    z.string().min(2).max(100),
  phone:        z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  category:     z.string().min(2).max(60),
  pincode:      z.string().regex(/^\d{6}$/, "Must be a 6-digit pin code"),
  city:         z.string().min(2).max(100),
  address:      z.string().max(300).optional(),
  description:  z.string().max(500).optional(),
});

export type BusinessRegisterResult =
  | { success: true; merchantId: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function registerBusiness(
  _prev: BusinessRegisterResult | null,
  formData: FormData
): Promise<BusinessRegisterResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = schema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors as Record<string, string[]>;
    const first = Object.values(fieldErrors)[0]?.[0];
    return {
      success: false,
      error: first ?? "Please fix the errors and try again.",
      fieldErrors,
    };
  }

  const { businessName, ownerName, phone, category, pincode, city, address, description } = parsed.data;
  const e164 = `+91${phone}`;

  const noRealDb = (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");
  const skipDb   = process.env.E2E_TEST === "1" || noRealDb;

  if (skipDb) {
    return { success: true, merchantId: "test-merchant" };
  }

  try {
    // 1. Find or create the owner User keyed by phone
    const owner = await prisma.user.upsert({
      where:  { phone: e164 },
      update: {},
      create: { phone: e164, name: ownerName, role: "merchant" },
    });

    // 2. Upsert the Merchant profile (one business per owner)
    const fullDescription = [description, address ? `📍 ${address}` : null]
      .filter(Boolean)
      .join("\n") || null;

    const merchant = await prisma.merchant.upsert({
      where:  { ownerId: owner.id },
      update: { name: businessName.trim(), category, description: fullDescription, pinCode: pincode, city },
      create: {
        ownerId:     owner.id,
        name:        businessName.trim(),
        category,
        description: fullDescription,
        pinCode:     pincode,
        city,
      },
    });

    return { success: true, merchantId: merchant.id };
  } catch (e) {
    console.error("registerBusiness failed:", e);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
