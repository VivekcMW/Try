"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Badge, Button, Pagination, Select } from "@/components/ui";
import type { AdminAdBooking } from "@/lib/admin-ads";
import { approveBooking, rejectBooking, cancelBooking } from "@/app/admin/ads/actions";

const STATUS_TONES: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  approved: "success", requested: "warning", rejected: "danger", cancelled: "neutral",
};

const PLACEMENT_LABELS: Record<string, string> = {
  feed_post: "Feed Post", search_slot: "Search Slot", story: "Story", banner: "Banner",
};

function paise(v: number): string {
  return `₹${(v / 100).toLocaleString("en-IN", { minimumFractionDigits: 0 })}`;
}

export default function AdBookingsTable({
  bookings, total, pages, page, status, placement,
}: {
  bookings: AdminAdBooking[]; total: number; pages: number; page: number;
  status: string; placement: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
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
        <Select defaultValue={status} onChange={e => push({ status: e.target.value, page: 1 })}>
          <option value="">All statuses</option>
          <option value="requested">Requested</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </Select>
        <Select defaultValue={placement} onChange={e => push({ placement: e.target.value, page: 1 })}>
          <option value="">All placements</option>
          {Object.entries(PLACEMENT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </Select>
        <span className="ml-auto text-sm text-gray-500">{total} bookings</span>
      </div>

      {error && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}

      <div className="overflow-x-auto rounded-md border border-border bg-surface">
        <table className="min-w-full text-sm">
          <thead className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              {["Campaign", "Advertiser", "Placement", "Pin", "Dates", "Quote", "Status", "Actions"].map(h => (
                <th key={h} className="whitespace-nowrap px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {bookings.length === 0 ? (
              <tr><td colSpan={8} className="py-12 text-center text-gray-400">No bookings found.</td></tr>
            ) : bookings.map(b => (
              <tr key={b.id} className="hover:bg-surface-muted/50">
                <td className="px-4 py-3 font-medium text-gray-900">{b.campaignName}</td>
                <td className="px-4 py-3 text-gray-600">{b.advertiserName}</td>
                <td className="px-4 py-3 text-gray-600">{PLACEMENT_LABELS[b.placement] ?? b.placement}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-400">{b.pinCode}</td>
                <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                  {new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{paise(b.quotePaise)}</td>
                <td className="px-4 py-3">
                  <Badge tone={STATUS_TONES[b.status] ?? "neutral"} variant="soft" className="capitalize text-xs">{b.status}</Badge>
                  {b.decisionNote && <div className="mt-1 max-w-45 truncate text-xs text-gray-400">{b.decisionNote}</div>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {b.status === "requested" && (
                      <>
                        <Button size="xs" onClick={() => run(b.id, approveBooking)} disabled={loadingId === b.id}>Approve</Button>
                        <Button size="xs" variant="ghost" className="text-red-600" disabled={loadingId === b.id}
                          onClick={() => { const note = prompt("Rejection note:"); if (note !== null) run(b.id, id => rejectBooking(id, note)); }}>
                          Reject
                        </Button>
                      </>
                    )}
                    {b.status === "approved" && (
                      <Button size="xs" variant="ghost" onClick={() => run(b.id, cancelBooking)} disabled={loadingId === b.id}>Cancel</Button>
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
