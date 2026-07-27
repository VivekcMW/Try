import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import { getAdsOverview } from "@/lib/admin-ads";

export const dynamic = "force-dynamic";

export default async function AdsOverviewPage() {
  const session = await getServerSession(authOptions);
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") redirect("/admin/login");

  const o = await getAdsOverview();

  const queues = [
    { href: "/admin/ads/bookings?status=requested",     label: "Bookings awaiting approval", value: o.pendingBookings,    urgent: o.pendingBookings > 0 },
    { href: "/admin/ads/creatives?status=pending_review", label: "Creatives awaiting review",  value: o.pendingCreatives,   urgent: o.pendingCreatives > 0 },
    { href: "/admin/ads/advertisers?status=pending",    label: "Advertisers pending onboarding", value: o.pendingAdvertisers, urgent: o.pendingAdvertisers > 0 },
  ];

  const today = [
    { label: "Live campaigns",   value: o.liveCampaigns.toLocaleString("en-IN") },
    { label: "Impressions today", value: o.todayImpressions.toLocaleString("en-IN") },
    { label: "Clicks today",      value: o.todayClicks.toLocaleString("en-IN") },
    { label: "Spend today",       value: `₹${(o.todaySpendPaise / 100).toLocaleString("en-IN")}` },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Ads" description="Booking approvals, creative review and campaign delivery." />

      <div className="grid gap-4 sm:grid-cols-3">
        {queues.map(q => (
          <Link key={q.href} href={q.href} className="rounded-md border border-border bg-surface p-4 transition hover:border-gray-400">
            <div className={`text-3xl font-semibold ${q.urgent ? "text-amber-600" : "text-gray-900"}`}>{q.value}</div>
            <div className="mt-1 text-sm text-gray-500">{q.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {today.map(s => (
          <div key={s.label} className="rounded-md border border-border bg-surface p-4">
            <div className="text-xl font-semibold text-gray-900">{s.value}</div>
            <div className="mt-1 text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <Link className="text-blue-600 hover:underline" href="/admin/ads/campaigns">All campaigns →</Link>
        <Link className="text-blue-600 hover:underline" href="/admin/ads/advertisers">Advertisers →</Link>
        <Link className="text-blue-600 hover:underline" href="/admin/ads/reports">Delivery report →</Link>
      </div>
    </div>
  );
}
