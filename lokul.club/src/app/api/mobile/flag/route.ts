/**
 * POST /api/mobile/flag  — thin wrapper over the reports table for in-app flagging
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VALID_REASONS = [
  "spam", "harassment", "misinformation", "nudity",
  "hate_speech", "violence", "child_safety", "illegal_goods",
  "impersonation", "other",
];
const SCAM_TO_ILLEGAL = (r: string) => (r === "scam" ? "illegal_goods" : r);

export async function POST(req: NextRequest) {
  try {
    const { reporterId, targetId, targetType, reason } = await req.json();
    if (!reporterId || !targetId || !targetType || !reason) {
      return NextResponse.json({ error: "reporterId, targetId, targetType, reason required" }, { status: 400 });
    }

    const mappedReason = SCAM_TO_ILLEGAL(reason);
    if (!VALID_REASONS.includes(mappedReason)) {
      return NextResponse.json({ error: "invalid reason" }, { status: 400 });
    }

    const existing = await prisma.report.findFirst({
      where: { reporterId, targetKind: targetType, targetId, status: { in: ["open", "in_review"] } },
    });
    if (existing) return NextResponse.json({ id: existing.id, duplicate: true });

    const report = await prisma.report.create({
      data: { reporterId, targetKind: targetType, targetId, reason: mappedReason as never },
    });

    return NextResponse.json({ id: report.id }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
