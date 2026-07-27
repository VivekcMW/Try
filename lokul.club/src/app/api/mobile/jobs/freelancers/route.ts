/**
 * GET  /api/mobile/jobs/freelancers — freelancer directory for a pinCode
 * POST /api/mobile/jobs/freelancers — create or update the caller's freelancer profile (upsert by userId)
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
    const freelancers = await prisma.freelancerProfile.findMany({
      where: {
        ...(pinCode ? { pinCode } : {}),
        ...(userId ? { userId } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      // Directory listing — phone is only shown on the detail route (used for
      // the explicit "Contact" tel: action), never in the list response.
      select: {
        id: true,
        userId: true,
        flat: true,
        skills: true,
        experience: true,
        hourlyRatePaise: true,
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

    return NextResponse.json({ freelancers });
  } catch {
    return NextResponse.json({ error: "Failed to load freelancers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      userId, flat, skills, experience, hourlyRatePaise, bio, phone, availability, pinCode,
    } = await req.json();

    if (!userId || !Array.isArray(skills) || skills.length === 0 || !hourlyRatePaise || !pinCode) {
      return NextResponse.json({ error: "userId, skills, hourlyRatePaise, pinCode required" }, { status: 400 });
    }

    const profile = await prisma.freelancerProfile.upsert({
      where: { userId },
      create: {
        userId,
        flat: flat || "Not specified",
        skills,
        experience: experience || "Not specified",
        hourlyRatePaise,
        bio: bio || null,
        phone: phone || null,
        availability: availability || null,
        pinCode,
      },
      update: {
        flat: flat || "Not specified",
        skills,
        experience: experience || "Not specified",
        hourlyRatePaise,
        bio: bio || null,
        phone: phone || null,
        availability: availability || null,
      },
      include: { user: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ freelancer: profile }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to save profile" }, { status: 400 });
  }
}
