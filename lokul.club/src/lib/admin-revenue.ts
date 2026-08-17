import { prisma } from "@/lib/prisma";

const noRealDb = (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");
const E2E = process.env.E2E_TEST === "1" || noRealDb;

const DAY_MS = 24 * 60 * 60 * 1000;

export type AdDayStat = { date: string; impressions: number; clicks: number; spendPaise: number };
export type ReferralFunnelStage = { stage: string; count: number };
export type TopPin = { pin: string; revenuePaise: number; bookings: number };
export type TopMerchant = { merchantId: string; name: string; gmvPaise: number; orders: number };

export type RevenueOverview = {
  adRevenueAllTimePaise: number;
  adRevenueThisWeekPaise: number;
  adRevenueTrendPct: number | null; // vs previous 7 days; null if no prior data to compare
  liveCampaigns: number;
  referralCreditsPaidPaise: number;
  adDaily: AdDayStat[]; // last 7 days
  referralFunnel: ReferralFunnelStage[];
  topPins: TopPin[];
  merchantGmvAllTimePaise: number;
  merchantGmvThisWeekPaise: number;
  merchantGmvTrendPct: number | null;
  topMerchantsByGmv: TopMerchant[];
};

export async function getRevenueOverview(): Promise<RevenueOverview> {
  if (E2E) {
    return {
      adRevenueAllTimePaise: 3_84000,
      adRevenueThisWeekPaise: 38400,
      adRevenueTrendPct: 12,
      liveCampaigns: 2,
      referralCreditsPaidPaise: 25000,
      adDaily: [{ date: "2026-07-01", impressions: 4200, clicks: 96, spendPaise: 38400 }],
      referralFunnel: [
        { stage: "Invited", count: 10 },
        { stage: "Signed Up", count: 6 },
        { stage: "Credited", count: 4 },
      ],
      topPins: [{ pin: "560001", revenuePaise: 500000, bookings: 2 }],
      merchantGmvAllTimePaise: 1_245_000,
      merchantGmvThisWeekPaise: 165000,
      merchantGmvTrendPct: 8,
      topMerchantsByGmv: [
        { merchantId: "m1", name: "Rahul's Grocery", gmvPaise: 45000, orders: 12 },
        { merchantId: "m3", name: "Amit Fast Food", gmvPaise: 120000, orders: 30 },
      ],
    };
  }


  const now = new Date();
  const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const sevenDaysAgo = new Date(todayUtc.getTime() - 6 * DAY_MS);
  const fourteenDaysAgo = new Date(todayUtc.getTime() - 13 * DAY_MS);

  const [
    allTimeAgg,
    last7Rows,
    prev7Agg,
    liveCampaigns,
    referralAgg,
    invitedCount,
    signedUpCount,
    creditedCount,
    topPinBookings,
    merchantAllTimeAgg,
    merchantLast7Agg,
    merchantPrev7Agg,
    topMerchantGroups,
  ] = await Promise.all([
    prisma.adEventDaily.aggregate({ _sum: { spendPaise: true } }),
    prisma.adEventDaily.findMany({
      where: { date: { gte: sevenDaysAgo } },
      select: { date: true, impressions: true, clicks: true, spendPaise: true },
      orderBy: { date: "asc" },
    }),
    prisma.adEventDaily.aggregate({
      where: { date: { gte: fourteenDaysAgo, lt: sevenDaysAgo } },
      _sum: { spendPaise: true },
    }),
    prisma.adCampaign.count({ where: { status: "live" } }),
    prisma.referralRecord.aggregate({
      where: { creditedAt: { not: null } },
      _sum: { creditPaise: true },
    }),
    prisma.referralRecord.count(),
    prisma.referralRecord.count({ where: { refereeId: { not: null } } }),
    prisma.referralRecord.count({ where: { creditedAt: { not: null } } }),
    prisma.adBooking.groupBy({
      by: ["pinCode"],
      where: { status: "approved" },
      _sum: { quotePaise: true },
      _count: { _all: true },
      orderBy: { _sum: { quotePaise: "desc" } },
      take: 5,
    }),
    prisma.merchantOrder.aggregate({ where: { paymentStatus: "paid" }, _sum: { totalPaise: true } }),
    prisma.merchantOrder.aggregate({
      where: { paymentStatus: "paid", createdAt: { gte: sevenDaysAgo } },
      _sum: { totalPaise: true },
    }),
    prisma.merchantOrder.aggregate({
      where: { paymentStatus: "paid", createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } },
      _sum: { totalPaise: true },
    }),
    prisma.merchantOrder.groupBy({
      by: ["merchantId"],
      where: { paymentStatus: "paid" },
      _sum: { totalPaise: true },
      _count: { _all: true },
      orderBy: { _sum: { totalPaise: "desc" } },
      take: 5,
    }),
  ]);

  const byDate = new Map<string, AdDayStat>();
  for (const r of last7Rows) {
    const key = r.date.toISOString().slice(0, 10);
    const existing = byDate.get(key) ?? { date: key, impressions: 0, clicks: 0, spendPaise: 0 };
    existing.impressions += r.impressions;
    existing.clicks += r.clicks;
    existing.spendPaise += r.spendPaise;
    byDate.set(key, existing);
  }
  const adDaily = Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));

  const adRevenueThisWeekPaise = adDaily.reduce((sum, d) => sum + d.spendPaise, 0);
  const prevWeekSpendPaise = prev7Agg._sum.spendPaise ?? 0;
  const adRevenueTrendPct =
    prevWeekSpendPaise > 0
      ? Math.round(((adRevenueThisWeekPaise - prevWeekSpendPaise) / prevWeekSpendPaise) * 100)
      : null;

  const merchantGmvThisWeekPaise = merchantLast7Agg._sum.totalPaise ?? 0;
  const merchantPrevWeekGmvPaise = merchantPrev7Agg._sum.totalPaise ?? 0;
  const merchantGmvTrendPct =
    merchantPrevWeekGmvPaise > 0
      ? Math.round(((merchantGmvThisWeekPaise - merchantPrevWeekGmvPaise) / merchantPrevWeekGmvPaise) * 100)
      : null;

  const topMerchantIds = topMerchantGroups.map((g) => g.merchantId);
  const topMerchantRecords = topMerchantIds.length
    ? await prisma.merchant.findMany({ where: { id: { in: topMerchantIds } }, select: { id: true, name: true } })
    : [];
  const merchantNameById = new Map(topMerchantRecords.map((m) => [m.id, m.name]));

  return {
    adRevenueAllTimePaise: allTimeAgg._sum.spendPaise ?? 0,
    adRevenueThisWeekPaise,
    adRevenueTrendPct,
    liveCampaigns,
    referralCreditsPaidPaise: referralAgg._sum.creditPaise ?? 0,
    adDaily,
    referralFunnel: [
      { stage: "Invited", count: invitedCount },
      { stage: "Signed Up", count: signedUpCount },
      { stage: "Credited", count: creditedCount },
    ],
    topPins: topPinBookings.map((p) => ({
      pin: p.pinCode,
      revenuePaise: p._sum.quotePaise ?? 0,
      bookings: p._count._all,
    })),
    merchantGmvAllTimePaise: merchantAllTimeAgg._sum.totalPaise ?? 0,
    merchantGmvThisWeekPaise,
    merchantGmvTrendPct,
    topMerchantsByGmv: topMerchantGroups.map((g) => ({
      merchantId: g.merchantId,
      name: merchantNameById.get(g.merchantId) ?? "Unknown merchant",
      gmvPaise: g._sum.totalPaise ?? 0,
      orders: g._count._all,
    })),
  };
}
