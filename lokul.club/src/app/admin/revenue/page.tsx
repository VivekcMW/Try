/**
 * /admin/revenue — Revenue & Monetization Analytics
 *
 * Surfaces real, Prisma-backed data only:
 *   - Ad revenue (all-time + last 7 days, from AdEventDaily)
 *   - Live ad campaign count
 *   - Referral funnel + credits paid (from ReferralRecord)
 *   - Top-performing PIN codes by approved ad-booking revenue
 *
 * There is no subscription/billing system in this app yet (no Subscription
 * model, no recurring billing) — MRR/ARR/subscriber-tier charts were removed
 * rather than left wired to nonexistent data.
 */
import { getServerUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getRevenueOverview } from "@/lib/admin-revenue";
import RevenueCharts from "@/components/admin/RevenueCharts";

export const dynamic = "force-dynamic";

export default async function RevenuePage() {
  const user = await getServerUser();
  // Bypass auth in development
  if (process.env.NODE_ENV !== "development" && user && (user as any)?.role !== "admin") redirect("/admin/login");

  const overview = await getRevenueOverview();

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Revenue & Monetization</h1>
        <p className="text-sm text-gray-500 mt-1">Ad yield, referral funnel, and top markets</p>
      </div>

      <RevenueCharts {...overview} />
    </div>
  );
}
