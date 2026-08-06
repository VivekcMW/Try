"use server";

import { getServerUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const noRealDb = (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");
const E2E = process.env.E2E_TEST === "1" || noRealDb;

async function requireAdmin(): Promise<string> {
  const user = await getServerUser();
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (user?.role !== "admin") throw new Error("Unauthorized");
  return user.id ?? "admin";
}

function revalidateAds() {
  revalidatePath("/admin/ads");
  revalidatePath("/admin/ads/advertisers");
  revalidatePath("/admin/ads/campaigns");
  revalidatePath("/admin/ads/bookings");
  revalidatePath("/admin/ads/creatives");
}

// ── Advertisers ──────────────────────────────────────────────────────────────

export async function approveAdvertiser(id: string) {
  await requireAdmin();
  if (!E2E) await prisma.advertiser.update({ where: { id }, data: { status: "approved" } });
  revalidateAds();
}

export async function suspendAdvertiser(id: string) {
  await requireAdmin();
  if (!E2E) {
    await prisma.$transaction([
      prisma.advertiser.update({ where: { id }, data: { status: "suspended" } }),
      // Kill switch: pause everything currently running for this advertiser.
      prisma.adCampaign.updateMany({ where: { advertiserId: id, status: { in: ["approved", "scheduled", "live"] } }, data: { status: "paused" } }),
    ]);
  }
  revalidateAds();
}

// ── Campaigns ────────────────────────────────────────────────────────────────

export async function approveCampaign(id: string) {
  const adminId = await requireAdmin();
  if (!E2E) {
    const approvedCreatives = await prisma.adCreative.count({ where: { campaignId: id, status: "approved" } });
    if (approvedCreatives === 0) return { ok: false, error: "Campaign needs at least one approved creative before approval." };
    await prisma.adCampaign.update({ where: { id }, data: { status: "scheduled", reviewedById: adminId, reviewNote: null } });
  }
  revalidateAds();
  return { ok: true };
}

export async function rejectCampaign(id: string, note: string) {
  const adminId = await requireAdmin();
  if (!E2E) await prisma.adCampaign.update({ where: { id }, data: { status: "rejected", reviewedById: adminId, reviewNote: note || "Rejected" } });
  revalidateAds();
  return { ok: true };
}

export async function pauseCampaign(id: string) {
  await requireAdmin();
  if (!E2E) await prisma.adCampaign.update({ where: { id }, data: { status: "paused" } });
  revalidateAds();
}

export async function resumeCampaign(id: string) {
  await requireAdmin();
  if (!E2E) await prisma.adCampaign.update({ where: { id }, data: { status: "live" } });
  revalidateAds();
}

export async function archiveCampaign(id: string) {
  await requireAdmin();
  if (!E2E) await prisma.adCampaign.update({ where: { id }, data: { status: "archived" } });
  revalidateAds();
}

// ── Bookings ─────────────────────────────────────────────────────────────────

export async function approveBooking(id: string) {
  const adminId = await requireAdmin();
  if (!E2E) {
    const booking = await prisma.adBooking.findUnique({ where: { id } });
    if (!booking) return { ok: false, error: "Booking not found." };
    // Conflict: another APPROVED booking for the same placement × pincode with
    // an overlapping date range.
    const conflict = await prisma.adBooking.findFirst({
      where: {
        id: { not: id },
        status: "approved",
        placement: booking.placement,
        pinCode: booking.pinCode,
        startDate: { lte: booking.endDate },
        endDate: { gte: booking.startDate },
      },
      include: { campaign: { select: { name: true } } },
    });
    if (conflict) {
      return { ok: false, error: `Conflicts with approved booking for "${conflict.campaign.name}" (${conflict.startDate.toISOString().slice(0, 10)} → ${conflict.endDate.toISOString().slice(0, 10)}).` };
    }
    await prisma.adBooking.update({ where: { id }, data: { status: "approved", decidedById: adminId, decidedAt: new Date() } });
  }
  revalidateAds();
  return { ok: true };
}

export async function rejectBooking(id: string, note: string) {
  const adminId = await requireAdmin();
  if (!E2E) await prisma.adBooking.update({ where: { id }, data: { status: "rejected", decisionNote: note || "Rejected", decidedById: adminId, decidedAt: new Date() } });
  revalidateAds();
  return { ok: true };
}

export async function cancelBooking(id: string) {
  const adminId = await requireAdmin();
  if (!E2E) await prisma.adBooking.update({ where: { id }, data: { status: "cancelled", decidedById: adminId, decidedAt: new Date() } });
  revalidateAds();
}

// ── Creatives ────────────────────────────────────────────────────────────────

export async function approveCreative(id: string) {
  const adminId = await requireAdmin();
  if (!E2E) await prisma.adCreative.update({ where: { id }, data: { status: "approved", rejectionReason: null, reviewedById: adminId, reviewedAt: new Date() } });
  revalidateAds();
}

export async function rejectCreative(id: string, reason: string) {
  const adminId = await requireAdmin();
  if (!E2E) await prisma.adCreative.update({ where: { id }, data: { status: "rejected", rejectionReason: reason || "Rejected", reviewedById: adminId, reviewedAt: new Date() } });
  revalidateAds();
}

export async function flagCreative(id: string) {
  const adminId = await requireAdmin();
  if (!E2E) await prisma.adCreative.update({ where: { id }, data: { status: "flagged", reviewedById: adminId, reviewedAt: new Date() } });
  revalidateAds();
}
