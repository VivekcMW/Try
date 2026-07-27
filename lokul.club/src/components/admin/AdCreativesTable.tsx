"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Badge, Button, Pagination, Select } from "@/components/ui";
import type { AdminAdCreative } from "@/lib/admin-ads";
import { approveCreative, rejectCreative, flagCreative } from "@/app/admin/ads/actions";

const STATUS_TONES: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  approved: "success", pending_review: "warning", rejected: "danger", flagged: "danger",
};

const PLACEMENT_LABELS: Record<string, string> = {
  feed_post: "Feed Post", search_slot: "Search Slot", story: "Story", banner: "Banner",
};

const REJECT_REASONS = [
  "Misleading claim",
  "Poor image quality",
  "Prohibited category",
  "Missing/incorrect pricing",
  "Targets a sacred (ad-free) zone",
];

export default function AdCreativesTable({
  creatives, total, pages, page, status, placement,
}: {
  creatives: AdminAdCreative[]; total: number; pages: number; page: number;
  status: string; placement: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  function push(updates: Record<string, string | number | undefined>) {
    const next = new URLSearchParams(params.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined || v === "") next.delete(k); else next.set(k, String(v));
    });
    router.push(`${pathname}?${next}`);
  }

  async function run(id: string, fn: (id: string) => Promise<unknown>) {
    setLoadingId(id);
    await fn(id);
    setLoadingId(null);
    router.refresh();
  }

  function onReject(id: string) {
    const hint = REJECT_REASONS.map((r, i) => `${i + 1}. ${r}`).join("\n");
    const input = prompt(`Rejection reason (or a number):\n${hint}`);
    if (input === null) return;
    const idx = Number.parseInt(input, 10);
    const reason = idx >= 1 && idx <= REJECT_REASONS.length ? REJECT_REASONS[idx - 1] : input;
    run(id, cid => rejectCreative(cid, reason));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select defaultValue={status} onChange={e => push({ status: e.target.value, page: 1 })}>
          <option value="">All statuses</option>
          <option value="pending_review">Pending review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="flagged">Flagged</option>
        </Select>
        <Select defaultValue={placement} onChange={e => push({ placement: e.target.value, page: 1 })}>
          <option value="">All placements</option>
          {Object.entries(PLACEMENT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </Select>
        <span className="ml-auto text-sm text-gray-500">{total} creatives</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {creatives.length === 0 ? (
          <div className="col-span-full rounded-md border border-border bg-surface py-12 text-center text-gray-400">No creatives found.</div>
        ) : creatives.map(c => (
          <div key={c.id} className="rounded-md border border-border bg-surface p-4">
            <div className="mb-3 flex items-center justify-between gap-2 text-xs text-gray-500">
              <span>{c.advertiserName} · {c.campaignName} · {PLACEMENT_LABELS[c.placement] ?? c.placement}</span>
              <Badge tone={STATUS_TONES[c.status] ?? "neutral"} variant="soft" className="text-xs">{c.status.replace("_", " ")}</Badge>
            </div>

            {/* Preview — mimics the native feed card with the mandatory Sponsored label */}
            <div className="rounded-md border border-border bg-surface-muted/40 p-3">
              <div className="flex items-start justify-between">
                <span className="text-sm font-semibold text-gray-900">{c.headline}</span>
                <span className="ml-2 shrink-0 text-[10px] text-gray-400">Sponsored</span>
              </div>
              <p className="mt-1 text-sm text-gray-600">{c.body}</p>
              {c.mediaKey && <div className="mt-2 rounded border border-dashed border-border px-3 py-6 text-center text-xs text-gray-400">media: {c.mediaKey}</div>}
              <div className="mt-2">
                <span className="inline-block rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white">{c.ctaLabel}</span>
                {c.ctaUrl && <span className="ml-2 text-xs text-gray-400">{c.ctaUrl}</span>}
              </div>
            </div>

            {c.rejectionReason && <div className="mt-2 text-xs text-red-600">Rejected: {c.rejectionReason}</div>}

            <div className="mt-3 flex gap-2">
              {c.status !== "approved" && (
                <Button size="xs" onClick={() => run(c.id, approveCreative)} disabled={loadingId === c.id}>Approve</Button>
              )}
              {c.status !== "rejected" && (
                <Button size="xs" variant="ghost" className="text-red-600" onClick={() => onReject(c.id)} disabled={loadingId === c.id}>Reject</Button>
              )}
              {c.status === "approved" && (
                <Button size="xs" variant="ghost" onClick={() => run(c.id, flagCreative)} disabled={loadingId === c.id}>Flag (kill switch)</Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Pagination page={page} pageCount={pages} onPageChange={p => push({ page: p })} />
    </div>
  );
}
