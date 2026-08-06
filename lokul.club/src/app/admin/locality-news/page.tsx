import { getServerUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Locality News | Lokul Admin" };

const CATEGORY_COLORS: Record<string, string> = {
  civic:     "bg-blue-100 text-blue-700",
  safety:    "bg-red-100 text-red-700",
  weather:   "bg-sky-100 text-sky-700",
  health:    "bg-green-100 text-green-700",
  transport: "bg-purple-100 text-purple-700",
  local:     "bg-gray-100 text-gray-700",
};

export default async function LocalityNewsPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ page?: string; category?: string; pinCode?: string }>;
}>) {
  const user = await getServerUser();
  // Bypass auth in development
  if (process.env.NODE_ENV !== "development" && user && (user as any)?.role !== "admin") redirect("/admin/login");

  const sp       = await searchParams;
  const page     = Math.max(1, Number.parseInt(sp.page ?? "1", 10));
  const category = sp.category ?? "";
  const pinCode  = sp.pinCode  ?? "";
  const PAGE_SIZE = 40;

  const noRealDb = (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");
  const E2E = process.env.E2E_TEST === "1" || noRealDb;

  const now = new Date();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    ...(category ? { category } : {}),
    ...(pinCode  ? { pinCode  } : {}),
  };

  const [items, total, alertCount, expiredCount] = E2E
    ? [[], 0, 0, 0]
    : await Promise.all([
        prisma.localityNews.findMany({
          where,
          orderBy: [{ isAlert: "desc" }, { publishedAt: "desc" }],
          skip: (page - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
        }),
        prisma.localityNews.count({ where }),
        prisma.localityNews.count({ where: { isAlert: true, expiresAt: { gt: now } } }),
        prisma.localityNews.count({ where: { expiresAt: { lte: now } } }),
      ]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Locality News"
        description="AI-summarised local news auto-refreshed via cron"
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Items",    value: total },
          { label: "Active Alerts",  value: alertCount },
          { label: "Expired Items",  value: expiredCount },
          { label: "Active Items",   value: total - expiredCount },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-[6px] border bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">{kpi.label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3">
        <select name="category" defaultValue={category}
          className="rounded-[6px] border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Categories</option>
          {["civic","safety","weather","health","transport","local"].map((c) => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
        <input name="pinCode" defaultValue={pinCode} placeholder="Filter by pincode"
          className="rounded-[6px] border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-44" />
        <button type="submit"
          className="rounded-[6px] bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Apply
        </button>
        {(category || pinCode) && (
          <a href="/admin/locality-news"
            className="rounded-[6px] border px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
            Clear
          </a>
        )}
      </form>

      {/* Table */}
      <Suspense fallback={<div className="text-sm text-gray-400">Loading…</div>}>
        <div className="overflow-x-auto rounded-[6px] border bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Headline", "Category", "Pincode", "Source", "Published", "Expires", "Alert"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">No news items found</td>
                </tr>
              ) : (
                items.map((item) => {
                  const expired = item.expiresAt < now;
                  return (
                    <tr key={item.id} className={expired ? "opacity-50" : ""}>
                      <td className="max-w-sm px-4 py-3">
                        <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer"
                          className="font-medium text-gray-900 hover:text-blue-600 line-clamp-2">
                          {item.headline}
                        </a>
                        <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">{item.summary}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-[6px] px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[item.category] ?? "bg-gray-100 text-gray-700"}`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{item.pinCode}</td>
                      <td className="px-4 py-3 text-gray-600">{item.sourceName}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {item.publishedAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={expired ? "text-red-500" : "text-gray-500"}>
                          {item.expiresAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {item.isAlert ? (
                          <span className="inline-block rounded-[6px] bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">ALERT</span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Suspense>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Showing page {page} of {pages} ({total} total)</span>
          <div className="flex gap-2">
            {page > 1 && (
              <a href={`?page=${page - 1}&category=${category}&pinCode=${pinCode}`}
                className="rounded-[6px] border px-3 py-1.5 hover:bg-gray-50">← Prev</a>
            )}
            {page < pages && (
              <a href={`?page=${page + 1}&category=${category}&pinCode=${pinCode}`}
                className="rounded-[6px] border px-3 py-1.5 hover:bg-gray-50">Next →</a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
