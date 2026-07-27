import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

// ── E2E / fixture mode ────────────────────────────────────────────────────────
const noRealDb = (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");
const E2E = process.env.E2E_TEST === "1" || noRealDb;

// ── Enum whitelists (single source for pages + dropdowns) ────────────────────
export const AD_ADVERTISER_STATUSES = ["pending", "approved", "suspended"] as const;
export const AD_CAMPAIGN_STATUSES = ["draft", "pending_approval", "approved", "rejected", "scheduled", "live", "paused", "completed", "archived"] as const;
export const AD_CREATIVE_STATUSES = ["pending_review", "approved", "rejected", "flagged"] as const;
export const AD_BOOKING_STATUSES = ["requested", "approved", "rejected", "cancelled"] as const;
export const AD_PLACEMENTS = ["feed_post", "search_slot", "story", "banner"] as const;
export const AD_PACKAGE_TIERS = ["micro_local", "growth", "brand", "national"] as const;

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type AdminAdvertiser = {
  id: string;
  name: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  merchantId: string | null;
  merchantName: string | null;
  status: string;
  campaignCount: number;
  createdAt: Date;
};

export type AdminAdCampaign = {
  id: string;
  advertiserId: string;
  advertiserName: string;
  name: string;
  packageTier: string;
  pricingModel: string;
  budgetPaise: number;
  spentPaise: number;
  startDate: Date;
  endDate: Date;
  status: string;
  creativeCount: number;
  bookingCount: number;
  createdAt: Date;
};

export type AdminAdCreative = {
  id: string;
  campaignId: string;
  campaignName: string;
  advertiserName: string;
  placement: string;
  headline: string;
  body: string;
  mediaKey: string | null;
  ctaLabel: string;
  ctaUrl: string | null;
  status: string;
  rejectionReason: string | null;
  createdAt: Date;
};

export type AdminAdBooking = {
  id: string;
  campaignId: string;
  campaignName: string;
  advertiserName: string;
  placement: string;
  pinCode: string;
  startDate: Date;
  endDate: Date;
  quotePaise: number;
  status: string;
  decisionNote: string | null;
  createdAt: Date;
};

// ─────────────────────────────────────────────────────────────────────────────
// FIXTURES (E2E)
// ─────────────────────────────────────────────────────────────────────────────

const FIXTURE_ADVERTISERS: AdminAdvertiser[] = [
  { id: "adv1", name: "Sharma Kirana", contactName: "Ramesh Sharma", contactEmail: "ramesh@sharmakirana.in", contactPhone: "+919810000001", merchantId: "m1", merchantName: "Sharma Kirana", status: "approved", campaignCount: 1, createdAt: new Date("2026-06-01") },
  { id: "adv2", name: "FreshCo Beverages", contactName: "Anita Desai", contactEmail: "anita@freshco.in", contactPhone: null, merchantId: null, merchantName: null, status: "pending", campaignCount: 1, createdAt: new Date("2026-06-20") },
];

const FIXTURE_CAMPAIGNS: AdminAdCampaign[] = [
  { id: "cmp1", advertiserId: "adv1", advertiserName: "Sharma Kirana", name: "Paneer Push July", packageTier: "micro_local", pricingModel: "cpm", budgetPaise: 500000, spentPaise: 120000, startDate: new Date("2026-07-01"), endDate: new Date("2026-07-31"), status: "live", creativeCount: 1, bookingCount: 1, createdAt: new Date("2026-06-25") },
  { id: "cmp2", advertiserId: "adv2", advertiserName: "FreshCo Beverages", name: "Summer Coolers", packageTier: "growth", pricingModel: "cpc", budgetPaise: 2000000, spentPaise: 0, startDate: new Date("2026-07-10"), endDate: new Date("2026-08-10"), status: "pending_approval", creativeCount: 1, bookingCount: 1, createdAt: new Date("2026-06-28") },
];

const FIXTURE_CREATIVES: AdminAdCreative[] = [
  { id: "cr1", campaignId: "cmp1", campaignName: "Paneer Push July", advertiserName: "Sharma Kirana", placement: "feed_post", headline: "Fresh paneer stock just arrived", body: "₹280/kg · Delivery available till 9 PM", mediaKey: null, ctaLabel: "Order Now", ctaUrl: "https://lokul.club/m/sharma-kirana", status: "approved", rejectionReason: null, createdAt: new Date("2026-06-26") },
  { id: "cr2", campaignId: "cmp2", campaignName: "Summer Coolers", advertiserName: "FreshCo Beverages", placement: "feed_post", headline: "Beat the heat with FreshCo", body: "Chilled lemonade delivered in 20 min", mediaKey: null, ctaLabel: "Try now", ctaUrl: null, status: "pending_review", rejectionReason: null, createdAt: new Date("2026-06-28") },
];

const FIXTURE_BOOKINGS: AdminAdBooking[] = [
  { id: "bk1", campaignId: "cmp1", campaignName: "Paneer Push July", advertiserName: "Sharma Kirana", placement: "feed_post", pinCode: "560001", startDate: new Date("2026-07-01"), endDate: new Date("2026-07-31"), quotePaise: 500000, status: "approved", decisionNote: null, createdAt: new Date("2026-06-25") },
  { id: "bk2", campaignId: "cmp2", campaignName: "Summer Coolers", advertiserName: "FreshCo Beverages", placement: "feed_post", pinCode: "560001", startDate: new Date("2026-07-10"), endDate: new Date("2026-08-10"), quotePaise: 2000000, status: "requested", decisionNote: null, createdAt: new Date("2026-06-28") },
];

// ─────────────────────────────────────────────────────────────────────────────
// QUERIES
// ─────────────────────────────────────────────────────────────────────────────

export async function getAdsOverview() {
  if (E2E) {
    return {
      pendingBookings: 1, pendingCreatives: 1, pendingAdvertisers: 1,
      liveCampaigns: 1, todayImpressions: 4200, todayClicks: 96, todaySpendPaise: 38400,
    };
  }
  const today = new Date(); today.setUTCHours(0, 0, 0, 0);
  const [pendingBookings, pendingCreatives, pendingAdvertisers, liveCampaigns, todayAgg] = await Promise.all([
    prisma.adBooking.count({ where: { status: "requested" } }),
    prisma.adCreative.count({ where: { status: "pending_review" } }),
    prisma.advertiser.count({ where: { status: "pending" } }),
    prisma.adCampaign.count({ where: { status: "live" } }),
    prisma.adEventDaily.aggregate({
      where: { date: today },
      _sum: { impressions: true, clicks: true, spendPaise: true },
    }),
  ]);
  return {
    pendingBookings, pendingCreatives, pendingAdvertisers, liveCampaigns,
    todayImpressions: todayAgg._sum.impressions ?? 0,
    todayClicks: todayAgg._sum.clicks ?? 0,
    todaySpendPaise: todayAgg._sum.spendPaise ?? 0,
  };
}

export async function getAdvertisers({
  page = 1, pageSize = 30, status = "", search = "",
}: { page?: number; pageSize?: number; status?: string; search?: string }) {
  if (E2E) {
    let list = [...FIXTURE_ADVERTISERS];
    if (status) list = list.filter(a => a.status === status);
    if (search) { const q = search.toLowerCase(); list = list.filter(a => a.name.toLowerCase().includes(q) || a.contactEmail.toLowerCase().includes(q)); }
    const start = (page - 1) * pageSize;
    return { advertisers: list.slice(start, start + pageSize), total: list.length, pages: Math.max(1, Math.ceil(list.length / pageSize)) };
  }
  const where: Prisma.AdvertiserWhereInput = {
    ...(status ? { status: status as never } : {}),
    ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" as const } }, { contactEmail: { contains: search, mode: "insensitive" as const } }] } : {}),
  };
  const [raw, total] = await Promise.all([
    prisma.advertiser.findMany({
      where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize,
      include: { merchant: { select: { name: true } }, _count: { select: { campaigns: true } } },
    }),
    prisma.advertiser.count({ where }),
  ]);
  const advertisers: AdminAdvertiser[] = raw.map(a => ({
    id: a.id, name: a.name, contactName: a.contactName, contactEmail: a.contactEmail,
    contactPhone: a.contactPhone ?? null, merchantId: a.merchantId ?? null,
    merchantName: a.merchant?.name ?? null, status: a.status,
    campaignCount: a._count.campaigns, createdAt: a.createdAt,
  }));
  return { advertisers, total, pages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getAdCampaigns({
  page = 1, pageSize = 30, status = "", search = "",
}: { page?: number; pageSize?: number; status?: string; search?: string }) {
  if (E2E) {
    let list = [...FIXTURE_CAMPAIGNS];
    if (status) list = list.filter(c => c.status === status);
    if (search) { const q = search.toLowerCase(); list = list.filter(c => c.name.toLowerCase().includes(q) || c.advertiserName.toLowerCase().includes(q)); }
    const start = (page - 1) * pageSize;
    return { campaigns: list.slice(start, start + pageSize), total: list.length, pages: Math.max(1, Math.ceil(list.length / pageSize)) };
  }
  const where: Prisma.AdCampaignWhereInput = {
    ...(status ? { status: status as never } : {}),
    ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" as const } }, { advertiser: { name: { contains: search, mode: "insensitive" as const } } }] } : {}),
  };
  const [raw, total] = await Promise.all([
    prisma.adCampaign.findMany({
      where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize,
      include: { advertiser: { select: { name: true } }, _count: { select: { creatives: true, bookings: true } } },
    }),
    prisma.adCampaign.count({ where }),
  ]);
  const campaigns: AdminAdCampaign[] = raw.map(c => ({
    id: c.id, advertiserId: c.advertiserId, advertiserName: c.advertiser.name,
    name: c.name, packageTier: c.packageTier, pricingModel: c.pricingModel,
    budgetPaise: c.budgetPaise, spentPaise: c.spentPaise,
    startDate: c.startDate, endDate: c.endDate, status: c.status,
    creativeCount: c._count.creatives, bookingCount: c._count.bookings, createdAt: c.createdAt,
  }));
  return { campaigns, total, pages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getAdCreatives({
  page = 1, pageSize = 30, status = "", placement = "", search = "",
}: { page?: number; pageSize?: number; status?: string; placement?: string; search?: string }) {
  if (E2E) {
    let list = [...FIXTURE_CREATIVES];
    if (status) list = list.filter(c => c.status === status);
    if (placement) list = list.filter(c => c.placement === placement);
    if (search) { const q = search.toLowerCase(); list = list.filter(c => c.headline.toLowerCase().includes(q) || c.campaignName.toLowerCase().includes(q)); }
    const start = (page - 1) * pageSize;
    return { creatives: list.slice(start, start + pageSize), total: list.length, pages: Math.max(1, Math.ceil(list.length / pageSize)) };
  }
  const where: Prisma.AdCreativeWhereInput = {
    ...(status ? { status: status as never } : {}),
    ...(placement ? { placement: placement as never } : {}),
    ...(search ? { OR: [{ headline: { contains: search, mode: "insensitive" as const } }, { campaign: { name: { contains: search, mode: "insensitive" as const } } }] } : {}),
  };
  const [raw, total] = await Promise.all([
    prisma.adCreative.findMany({
      where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize,
      include: { campaign: { select: { name: true, advertiser: { select: { name: true } } } } },
    }),
    prisma.adCreative.count({ where }),
  ]);
  const creatives: AdminAdCreative[] = raw.map(c => ({
    id: c.id, campaignId: c.campaignId, campaignName: c.campaign.name,
    advertiserName: c.campaign.advertiser.name, placement: c.placement,
    headline: c.headline, body: c.body, mediaKey: c.mediaKey ?? null,
    ctaLabel: c.ctaLabel, ctaUrl: c.ctaUrl ?? null, status: c.status,
    rejectionReason: c.rejectionReason ?? null, createdAt: c.createdAt,
  }));
  return { creatives, total, pages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getAdBookings({
  page = 1, pageSize = 30, status = "", placement = "", search = "",
}: { page?: number; pageSize?: number; status?: string; placement?: string; search?: string }) {
  if (E2E) {
    let list = [...FIXTURE_BOOKINGS];
    if (status) list = list.filter(b => b.status === status);
    if (placement) list = list.filter(b => b.placement === placement);
    if (search) { const q = search.toLowerCase(); list = list.filter(b => b.campaignName.toLowerCase().includes(q) || b.pinCode.includes(q)); }
    const start = (page - 1) * pageSize;
    return { bookings: list.slice(start, start + pageSize), total: list.length, pages: Math.max(1, Math.ceil(list.length / pageSize)) };
  }
  const where: Prisma.AdBookingWhereInput = {
    ...(status ? { status: status as never } : {}),
    ...(placement ? { placement: placement as never } : {}),
    ...(search ? { OR: [{ pinCode: { contains: search } }, { campaign: { name: { contains: search, mode: "insensitive" as const } } }] } : {}),
  };
  const [raw, total] = await Promise.all([
    prisma.adBooking.findMany({
      where, orderBy: [{ status: "asc" }, { createdAt: "desc" }], skip: (page - 1) * pageSize, take: pageSize,
      include: { campaign: { select: { name: true, advertiser: { select: { name: true } } } } },
    }),
    prisma.adBooking.count({ where }),
  ]);
  const bookings: AdminAdBooking[] = raw.map(b => ({
    id: b.id, campaignId: b.campaignId, campaignName: b.campaign.name,
    advertiserName: b.campaign.advertiser.name, placement: b.placement,
    pinCode: b.pinCode, startDate: b.startDate, endDate: b.endDate,
    quotePaise: b.quotePaise, status: b.status,
    decisionNote: b.decisionNote ?? null, createdAt: b.createdAt,
  }));
  return { bookings, total, pages: Math.max(1, Math.ceil(total / pageSize)) };
}

// ─────────────────────────────────────────────────────────────────────────────
// REPORTS
// ─────────────────────────────────────────────────────────────────────────────

export type AdsReportRow = {
  date: string;
  campaignName: string;
  advertiserName: string;
  placement: string;
  impressions: number;
  clicks: number;
  hides: number;
  spendPaise: number;
};

export async function getAdsReport({ from, to }: { from?: string; to?: string }) {
  if (E2E) {
    const rows: AdsReportRow[] = [
      { date: "2026-07-02", campaignName: "Paneer Push July", advertiserName: "Sharma Kirana", placement: "feed_post", impressions: 4200, clicks: 96, hides: 3, spendPaise: 38400 },
    ];
    return { rows, totals: { impressions: 4200, clicks: 96, hides: 3, spendPaise: 38400 } };
  }
  const where: Prisma.AdEventDailyWhereInput = {
    ...(from || to
      ? { date: { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(to) } : {}) } }
      : {}),
  };
  const raw = await prisma.adEventDaily.findMany({
    where, orderBy: { date: "desc" }, take: 500,
    include: { creative: { select: { placement: true, campaign: { select: { name: true, advertiser: { select: { name: true } } } } } } },
  });
  const rows: AdsReportRow[] = raw.map(r => ({
    date: r.date.toISOString().slice(0, 10),
    campaignName: r.creative.campaign.name,
    advertiserName: r.creative.campaign.advertiser.name,
    placement: r.creative.placement,
    impressions: r.impressions, clicks: r.clicks, hides: r.hides, spendPaise: r.spendPaise,
  }));
  const totals = rows.reduce(
    (acc, r) => ({ impressions: acc.impressions + r.impressions, clicks: acc.clicks + r.clicks, hides: acc.hides + r.hides, spendPaise: acc.spendPaise + r.spendPaise }),
    { impressions: 0, clicks: 0, hides: 0, spendPaise: 0 },
  );
  return { rows, totals };
}
