/**
 * GET  /api/mobile/jobs — job listings for a pinCode (optionally filter by posterId for "My Posts";
 *   pass userId to annotate each job with `appliedByMe`)
 * POST /api/mobile/jobs — post a job
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const JOB_TYPES = ["full_time", "part_time", "freelance", "internship"];
const WORK_MODES = ["onsite", "remote", "hybrid"];

export async function GET(req: NextRequest) {
  const pinCode = req.nextUrl.searchParams.get("pinCode");
  const posterId = req.nextUrl.searchParams.get("posterId");
  const userId = req.nextUrl.searchParams.get("userId");

  if (!pinCode && !posterId) {
    return NextResponse.json({ error: "pinCode or posterId required" }, { status: 400 });
  }

  try {
    const jobs = await prisma.job.findMany({
      where: {
        ...(pinCode ? { pinCode } : {}),
        ...(posterId ? { posterId } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        poster: { select: { id: true, name: true } },
        _count: { select: { applications: true } },
        ...(userId ? { applications: { where: { applicantId: userId }, select: { id: true } } } : {}),
      },
    });

    const shaped = jobs.map((j) => ({
      ...j,
      applicantCount: j._count.applications,
      appliedByMe: userId ? (j as unknown as { applications: unknown[] }).applications.length > 0 : false,
    }));

    return NextResponse.json({ jobs: shaped });
  } catch {
    return NextResponse.json({ error: "Failed to load jobs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      posterId, title, category, type, workMode, location, salary,
      experience, description, pinCode,
    } = await req.json();

    if (!posterId || !title || !category || !location || !salary || !pinCode) {
      return NextResponse.json({ error: "posterId, title, category, location, salary, pinCode required" }, { status: 400 });
    }
    if (type && !JOB_TYPES.includes(type)) {
      return NextResponse.json({ error: "invalid type" }, { status: 400 });
    }
    if (workMode && !WORK_MODES.includes(workMode)) {
      return NextResponse.json({ error: "invalid workMode" }, { status: 400 });
    }

    const job = await prisma.job.create({
      data: {
        posterId,
        title,
        category,
        type: type ?? "full_time",
        workMode: workMode ?? "onsite",
        location,
        salary,
        experience: experience || "Not specified",
        description: description || null,
        pinCode,
      },
      include: { poster: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ job: { ...job, applicantCount: 0, appliedByMe: false } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to post job" }, { status: 400 });
  }
}
