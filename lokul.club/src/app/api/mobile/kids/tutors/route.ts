/**
 * GET  /api/mobile/kids/tutors — tutor directory for a pinCode
 * POST /api/mobile/kids/tutors — create or update the caller's tutor profile (upsert by userId)
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const pinCode = req.nextUrl.searchParams.get("pinCode");
  const userId = req.nextUrl.searchParams.get("userId");
  if (!pinCode && !userId) {
    return NextResponse.json({ error: "pinCode or userId required" }, { status: 400 });
  }

  try {
    const tutors = await prisma.kidsTutorProfile.findMany({
      where: {
        ...(pinCode ? { pinCode } : {}),
        ...(userId ? { userId } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      // Directory listing — phone is only shown on the detail route (used for
      // the explicit "Contact Tutor" tel: action), never in the list response.
      select: {
        id: true,
        userId: true,
        flat: true,
        subjects: true,
        grades: true,
        experience: true,
        pricePerHourPaise: true,
        rating: true,
        reviews: true,
        available: true,
        bio: true,
        availability: true,
        pinCode: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json({ tutors });
  } catch {
    return NextResponse.json({ error: "Failed to load tutors" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      userId, flat, subjects, grades, experience, pricePerHourPaise, bio, phone, availability, pinCode,
    } = await req.json();

    if (!userId || !Array.isArray(subjects) || subjects.length === 0 || !grades || !experience || pricePerHourPaise == null || !pinCode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const tutor = await prisma.kidsTutorProfile.upsert({
      where: { userId },
      create: {
        userId,
        flat: flat || "Not specified",
        subjects,
        grades,
        experience,
        pricePerHourPaise,
        bio: bio || null,
        phone: phone || null,
        availability: availability || null,
        pinCode,
      },
      update: {
        flat: flat || "Not specified",
        subjects,
        grades,
        experience,
        pricePerHourPaise,
        bio: bio || null,
        phone: phone || null,
        availability: availability || null,
        available: true,
      },
      include: { user: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ tutor }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to save profile" }, { status: 400 });
  }
}
