import { getServerUser } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { getAdsReport } from "@/lib/admin-ads";

export const dynamic = "force-dynamic";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(req: NextRequest) {
  const user = await getServerUser();
  if ((user as { role?: string } | null)?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sp   = req.nextUrl.searchParams;
  const from = DATE_RE.test(sp.get("from") ?? "") ? sp.get("from")! : undefined;
  const to   = DATE_RE.test(sp.get("to") ?? "")   ? sp.get("to")!   : undefined;

  const { rows, totals } = await getAdsReport({ from, to });

  if (sp.get("format") === "csv") {
    const esc = (v: string | number) => `"${String(v).replaceAll('"', '""')}"`;
    const header = "date,campaign,advertiser,placement,impressions,clicks,hides,spend_paise";
    const lines = rows.map(r =>
      [r.date, esc(r.campaignName), esc(r.advertiserName), r.placement, r.impressions, r.clicks, r.hides, r.spendPaise].join(","),
    );
    return new NextResponse([header, ...lines].join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="ads-report-${from ?? "all"}-${to ?? "all"}.csv"`,
      },
    });
  }

  return NextResponse.json({ rows, totals });
}
