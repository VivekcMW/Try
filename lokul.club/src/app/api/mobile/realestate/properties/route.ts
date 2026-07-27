/**
 * GET  /api/mobile/realestate/properties — property listings for a pinCode (optionally filter by dealType)
 * POST /api/mobile/realestate/properties — post a new listing
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEAL_TYPES = ["sale", "rent", "pg"];
const BUILDING_TYPES = ["apartment", "house", "villa", "plot", "pg"];

export async function GET(req: NextRequest) {
  const pinCode = req.nextUrl.searchParams.get("pinCode");
  const dealType = req.nextUrl.searchParams.get("dealType");

  if (!pinCode) return NextResponse.json({ error: "pinCode required" }, { status: 400 });

  try {
    const properties = await prisma.propertyListing.findMany({
      where: {
        pinCode,
        ...(dealType ? { dealType: dealType as "sale" | "rent" | "pg" } : {}),
      },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: 100,
      include: { owner: { select: { id: true, name: true, kycTier: true } } },
    });

    return NextResponse.json({ properties });
  } catch {
    return NextResponse.json({ error: "Failed to load properties" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      ownerId, title, dealType, buildingType, bhk, areaSqft, pricePaise, priceUnit,
      location, amenities, furnishing, floor, availableFrom, description, pinCode,
    } = await req.json();

    if (!ownerId || !title || !dealType || !buildingType || !areaSqft || !pricePaise || !location || !pinCode) {
      return NextResponse.json({ error: "ownerId, title, dealType, buildingType, areaSqft, pricePaise, location, pinCode required" }, { status: 400 });
    }
    if (!DEAL_TYPES.includes(dealType) || !BUILDING_TYPES.includes(buildingType)) {
      return NextResponse.json({ error: "invalid dealType or buildingType" }, { status: 400 });
    }

    const property = await prisma.propertyListing.create({
      data: {
        ownerId, title, dealType, buildingType, bhk: bhk ?? null, areaSqft, pricePaise,
        priceUnit: priceUnit ?? null, location, amenities: amenities ?? [], furnishing: furnishing ?? null,
        floor: floor ?? null, availableFrom: availableFrom ?? null, description: description ?? null, pinCode,
      },
      include: { owner: { select: { id: true, name: true, kycTier: true } } },
    });

    return NextResponse.json({ property }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to post listing" }, { status: 400 });
  }
}
