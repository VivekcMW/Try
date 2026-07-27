/**
 * GET /api/web/rwa/[societyId] — society admin dashboard data
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const E2E = process.env.E2E_TEST === "1" || (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");

const STUB = {
  society: {
    id: "soc-demo",
    name: "Aundh Residency",
    address: "Survey No. 45, Aundh",
    city: "Pune",
    pinCode: "411007",
    memberCount: 124,
    postCount: 312,
    status: "approved",
  },
  stats: {
    totalMembers: 124,
    activeThisWeek: 47,
    openNotices: 3,
    pendingVisitors: 5,
    openPolls: 2,
    pendingKyc: 8,
  },
  recentNotices: [
    { id: "n1", body: "Society maintenance on Saturday 10 AM–2 PM. Water will be off.", createdAt: new Date(Date.now() - 2 * 3_600_000).toISOString(), pinned: true },
    { id: "n2", body: "AGM scheduled for June 15. All flat owners must attend.", createdAt: new Date(Date.now() - 24 * 3_600_000).toISOString(), pinned: false },
    { id: "n3", body: "New security guard schedule effective from Monday.", createdAt: new Date(Date.now() - 48 * 3_600_000).toISOString(), pinned: false },
  ],
  pendingVisitors: [
    { id: "v1", name: "Suresh Kumar", purpose: "Delivery", hostFlat: "A-304", arrivalTime: new Date(Date.now() + 3_600_000).toISOString() },
    { id: "v2", name: "Meera Joshi",  purpose: "Guest",    hostFlat: "B-102", arrivalTime: new Date(Date.now() + 2 * 3_600_000).toISOString() },
    { id: "v3", name: "Raju Prasad",  purpose: "Service",  hostFlat: "C-501", arrivalTime: new Date(Date.now() + 4 * 3_600_000).toISOString() },
  ],
  polls: [
    { id: "p1", question: "Should we install CCTV in basement parking?", totalVotes: 67, yesCount: 54, noCount: 13, closesAt: new Date(Date.now() + 3 * 24 * 3_600_000).toISOString() },
    { id: "p2", question: "Approve ₹50,000 for garden renovation?",         totalVotes: 42, yesCount: 38, noCount: 4,  closesAt: new Date(Date.now() + 5 * 24 * 3_600_000).toISOString() },
  ],
  recentMembers: [
    { id: "u1", name: "Priya Sharma",  flat: "A-201", kycTier: "silver", joinedAt: new Date(Date.now() - 7  * 24 * 3_600_000).toISOString() },
    { id: "u2", name: "Raj Patel",     flat: "B-304", kycTier: "bronze", joinedAt: new Date(Date.now() - 14 * 24 * 3_600_000).toISOString() },
    { id: "u3", name: "Anita Verma",   flat: "C-102", kycTier: "gold",   joinedAt: new Date(Date.now() - 21 * 24 * 3_600_000).toISOString() },
  ],
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ societyId: string }> }
) {
  const { societyId } = await params;

  if (E2E) {
    return NextResponse.json({ ...STUB, society: { ...STUB.society, id: societyId } });
  }

  try {
    const society = await prisma.society.findUnique({
      where: { id: societyId },
      include: { admins: { where: { revokedAt: null } } },
    });

    if (!society) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3_600_000);

    const [notices, activeAuthors, pendingKycUsers, polls, recentMembers] = await Promise.all([
      prisma.post.findMany({
        where: { societyId, type: "rwa_notice", status: "active" },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, body: true, createdAt: true, pinnedUntil: true },
      }),
      prisma.post.findMany({
        where: { societyId, status: "active", createdAt: { gte: sevenDaysAgo } },
        select: { authorId: true },
        distinct: ["authorId"],
      }),
      prisma.kycDocument.findMany({
        where: { status: "pending", user: { residences: { some: { societyId } } } },
        select: { userId: true },
        distinct: ["userId"],
      }),
      prisma.post.findMany({
        where: { societyId, type: "poll", status: "active" },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: { id: true, body: true, createdAt: true },
      }),
      prisma.userResidence.findMany({
        where: { societyId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { user: { select: { id: true, name: true, kycTier: true } } },
      }),
    ]);

    return NextResponse.json({
      society: {
        id: society.id,
        name: society.name,
        address: society.address,
        city: society.city,
        pinCode: society.pinCode,
        memberCount: society.memberCount,
        postCount: society.postCount,
        status: society.status,
      },
      stats: {
        totalMembers: society.memberCount,
        activeThisWeek: activeAuthors.length,
        openNotices: notices.length,
        // No visitor-management model exists yet — honestly 0/empty rather than
        // fabricated from unrelated posts.
        pendingVisitors: 0,
        openPolls: polls.length,
        pendingKyc: pendingKycUsers.length,
      },
      recentNotices: notices.map((n) => ({
        id: n.id,
        body: n.body,
        createdAt: n.createdAt.toISOString(),
        pinned: !!n.pinnedUntil && n.pinnedUntil > new Date(),
      })),
      // No visitor-management model exists yet.
      pendingVisitors: [],
      polls: polls.map((p) => ({
        id: p.id,
        question: p.body,
        // No poll-voting model exists yet — votes are honestly 0, not fabricated.
        totalVotes: 0,
        yesCount: 0,
        noCount: 0,
        closesAt: new Date(p.createdAt.getTime() + 7 * 24 * 3_600_000).toISOString(),
      })),
      recentMembers: recentMembers.map((r) => ({
        id: r.user.id,
        name: r.user.name,
        flat: r.flatNumber,
        kycTier: r.user.kycTier,
        joinedAt: r.createdAt.toISOString(),
      })),
    });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
