import { getServerUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { getAdsReport } from "@/lib/admin-ads";

export const dynamic = "force-dynamic";

function paise(v: number): string {
  return `₹${(v / 100).toLocaleString("en-IN", { minimumFractionDigits: 0 })}`;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default async function AdsReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const user = await getServerUser();
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") redirect("/admin/login");

  const sp   = await searchParams;
  const from = DATE_RE.test(sp.from ?? "") ? sp.from! : "";
  const to   = DATE_RE.test(sp.to ?? "")   ? sp.to!   : "";

  const { rows, totals } = await getAdsReport({ from: from || undefined, to: to || undefined });
  const csvQs = new URLSearchParams({ ...(from ? { from } : {}), ...(to ? { to } : {}), format: "csv" });

  return (
    <div className="space-y-4">
      <PageHeader title="Ads Delivery Report" description="Daily impressions, clicks and spend per creative." />

      <form className="flex flex-wrap items-end gap-3" action="/admin/ads/reports" method="get">
        <label className="text-sm text-gray-600">
          From
          <input type="date" name="from" defaultValue={from} className="ml-2 rounded-md border border-border bg-surface px-2 py-1 text-sm" />
        </label>
        <label className="text-sm text-gray-600">
          To
          <input type="date" name="to" defaultValue={to} className="ml-2 rounded-md border border-border bg-surface px-2 py-1 text-sm" />
        </label>
        <button type="submit" className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">Apply</button>
        <a href={`/api/admin/ads/report?${csvQs}`} className="rounded-md border border-border px-3 py-1.5 text-sm text-gray-700 hover:bg-surface-muted">Export CSV</a>
      </form>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Impressions", value: totals.impressions.toLocaleString("en-IN") },
          { label: "Clicks", value: totals.clicks.toLocaleString("en-IN") },
          { label: "Hides", value: totals.hides.toLocaleString("en-IN") },
          { label: "Spend", value: paise(totals.spendPaise) },
        ].map(s => (
          <div key={s.label} className="rounded-md border border-border bg-surface p-4">
            <div className="text-xl font-semibold text-gray-900">{s.value}</div>
            <div className="mt-1 text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-md border border-border bg-surface">
        <table className="min-w-full text-sm">
          <thead className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              {["Date", "Campaign", "Advertiser", "Placement", "Impr.", "Clicks", "Hides", "Spend"].map(h => (
                <th key={h} className="whitespace-nowrap px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.length === 0 ? (
              <tr><td colSpan={8} className="py-12 text-center text-gray-400">No delivery data in this range.</td></tr>
            ) : rows.map(r => (
              <tr key={`${r.date}-${r.campaignName}-${r.placement}`} className="hover:bg-surface-muted/50">
                <td className="px-4 py-3 font-mono text-xs text-gray-400">{r.date}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{r.campaignName}</td>
                <td className="px-4 py-3 text-gray-600">{r.advertiserName}</td>
                <td className="px-4 py-3 text-gray-600">{r.placement.replace("_", " ")}</td>
                <td className="px-4 py-3 text-gray-600">{r.impressions.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3 text-gray-600">{r.clicks.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3 text-gray-600">{r.hides.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{paise(r.spendPaise)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
