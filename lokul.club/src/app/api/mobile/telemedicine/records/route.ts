/**
 * GET  /api/mobile/telemedicine/records — a user's health records
 * POST /api/mobile/telemedicine/records — save a health record
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  try {
    const records = await prisma.telemedHealthRecord.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json({ records });
  } catch {
    return NextResponse.json({ error: "Failed to load records" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, type, title, doctorName, fileUrl, note } = await req.json();

    if (!userId || !type || !title) {
      return NextResponse.json({ error: "userId, type, title required" }, { status: 400 });
    }

    const record = await prisma.telemedHealthRecord.create({
      data: { userId, type, title, doctorName: doctorName ?? null, fileUrl: fileUrl ?? null, note: note ?? null },
    });

    return NextResponse.json({ record }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to save record" }, { status: 400 });
  }
}
