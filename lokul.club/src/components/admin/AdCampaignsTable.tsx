"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Badge, Button, Input, Pagination, Select } from "@/components/ui";
import type { AdminAdCampaign } from "@/lib/admin-ads";
import { approveCampaign, rejectCampaign, pauseCampaign, resumeCampaign, archiveCampaign } from "@/app/admin/ads/actions";

const STATUS_TONES: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  live: "success", scheduled: "success", approved: "success",
  pending_approval: "warning", paused: "warning", draft: "neutral",
  rejected: "danger", completed: "neutral", archived: "neutral",
};

const TIER_LABELS: Record<string, string> = {
  micro_local: "Micro Local", growth: "Growth", brand: "Brand", national: "National",
};

function paise(v: number): string {
  return `₹${(v / 100).toLocaleString("en-IN", { minimumFractionDigits: 0 })}`;
}

export default function AdCampaignsTable({
  campaigns, total, pages, page, status, search,
}: {
  campaigns: AdminAdCampaign[]; total: number; pages: number; page: number;
  status: string; search: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(search);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function push(updates: Record<string, string | number | undefined>) {
    const next = new URLSearchParams(params.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined || v === "") next.delete(k); else next.set(k, String(v));
    });
    router.push(`${pathname}?${next}`);
  }

  async function run(id: string, fn: (id: string) => Promise<void | { ok: boolean; error?: string }>) {
    setLoadingId(id);
    setError(null);
    const res = await fn(id);
    if (res && !res.ok) setError(res.error ?? "Action failed");
    setLoadingId(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input placeholder="Search campaigns…" value={q} onChange={e => setQ(e.target.value)}
          onKeyDown={e => e.key === "Enter" && push({ search: q, page: 1 })} className="w-64" />
        <Select defaultValue={status} onChange={e => push({ status: e.target.value, page: 1 })}>
          <option value="">All statuses</option>
          {["draft", "pending_approval", "approved", "rejected", "scheduled", "live", "paused", "completed", "archived"].map(s => (
            <option key={s} value={s}>{s.replace("_", " ")}</option>
          ))}
        </Select>
        <span className="ml-auto text-sm text-gray-500">{total} campaigns</span>
      </div>

      {error && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}

      <div className="overflow-x-auto rounded-md border border-border bg-surface">
        <table className="min-w-full text-sm">
          <thead className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              {["Campaign", "Advertiser", "Package", "Budget / Spent", "Schedule", "Creatives", "Status", "Actions"].map(h => (
                <th key={h} className="whitespace-nowrap px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {campaigns.length === 0 ? (
              <tr><td colSpan={8} className="py-12 text-center text-gray-400">No campaigns found.</td></tr>
            ) : campaigns.map(c => (
              <tr key={c.id} className="hover:bg-surface-muted/50">
                <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                <td className="px-4 py-3 text-gray-600">{c.advertiserName}</td>
                <td className="px-4 py-3 text-gray-600">
                  {TIER_LABELS[c.packageTier] ?? c.packageTier}
                  <span className="ml-1 text-xs uppercase text-gray-400">{c.pricingModel}</span>
                </td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                  {paise(c.budgetPaise)}
                  <span className="text-xs text-gray-400"> / {paise(c.spentPaise)} spent</span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                  {new Date(c.startDate).toLocaleDateString()} → {new Date(c.endDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-gray-600">{c.creativeCount}</td>
                <td className="px-4 py-3">
                  <Badge tone={STATUS_TONES[c.status] ?? "neutral"} variant="soft" className="text-xs">{c.status.replace("_", " ")}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {c.status === "pending_approval" && (
                      <>
                        <Button size="xs" onClick={() => run(c.id, approveCampaign)} disabled={loadingId === c.id}>Approve</Button>
                        <Button size="xs" variant="ghost" className="text-red-600" disabled={loadingId === c.id}
                          onClick={() => { const note = prompt("Rejection note:"); if (note !== null) run(c.id, id => rejectCampaign(id, note)); }}>
                          Reject
                        </Button>
                      </>
                    )}
                    {(c.status === "live" || c.status === "scheduled") && (
                      <Button size="xs" variant="ghost" onClick={() => run(c.id, pauseCampaign)} disabled={loadingId === c.id}>Pause</Button>
                    )}
                    {c.status === "paused" && (
                      <Button size="xs" onClick={() => run(c.id, resumeCampaign)} disabled={loadingId === c.id}>Resume</Button>
                    )}
                    {(c.status === "completed" || c.status === "rejected" || c.status === "paused") && (
                      <Button size="xs" variant="ghost" onClick={() => run(c.id, archiveCampaign)} disabled={loadingId === c.id}>Archive</Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} pageCount={pages} onPageChange={p => push({ page: p })} />
    </div>
  );
}
