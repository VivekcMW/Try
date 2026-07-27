/**
 * POST /api/mobile/reports  — submit a content / user report
 * GET  /api/mobile/reports  — list reporter's own pending reports (user-facing)
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VALID_REASONS = [
  "spam",
  "harassment",
  "misinformation",
  "nudity",
  "hate_speech",
  "violence",
  "child_safety",
  "illegal_goods",
  "impersonation",
  "other",
] as const;

const VALID_TARGETS = ["post", "user", "comment", "classified", "listing"] as const;

export async function POST(req: NextRequest) {
  try {
    const { reporterId, targetKind, targetId, reason, freeText } = await req.json();

    if (!reporterId || !targetKind || !targetId || !reason) {
      return NextResponse.json(
        { error: "reporterId, targetKind, targetId, reason required" },
        { status: 400 }
      );
    }

    if (!VALID_REASONS.includes(reason)) {
      return NextResponse.json({ error: "invalid reason" }, { status: 400 });
    }

    if (!VALID_TARGETS.includes(targetKind)) {
      return NextResponse.json({ error: "invalid targetKind" }, { status: 400 });
    }

    // Prevent duplicate open reports from same user on same target
    const existing = await prisma.report.findFirst({
      where: { reporterId, targetKind, targetId, status: { in: ["open", "in_review"] } },
    });
    if (existing) {
      return NextResponse.json({ id: existing.id, duplicate: true }, { status: 200 });
    }

    const report = await prisma.report.create({
      data: {
        reporterId,
        targetKind,
        targetId,
        reason,
        freeText: freeText?.trim() || null,
      },
    });

    return NextResponse.json({ id: report.id }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const reporterId = req.nextUrl.searchParams.get("reporterId");
  if (!reporterId) return NextResponse.json({ error: "reporterId required" }, { status: 400 });

  try {
    const reports = await prisma.report.findMany({
      where:   { reporterId },
      orderBy: { createdAt: "desc" },
      take:    20,
      select:  { id: true, targetKind: true, targetId: true, reason: true, status: true, createdAt: true },
    });
    return NextResponse.json({ reports });
  } catch {
    return NextResponse.json({ reports: [] });
  }
}
