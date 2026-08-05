"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Badge, Button, Input, Pagination, Select } from "@/components/ui";
import type { AdminAdvertiser } from "@/lib/admin-ads";
import { approveAdvertiser, suspendAdvertiser } from "@/app/admin/ads/actions";

const STATUS_TONES: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  approved: "success", pending: "warning", suspended: "danger",
};

export default function AdvertisersTable({
  advertisers, total, pages, page, status, search,
}: {
  advertisers: AdminAdvertiser[]; total: number; pages: number; page: number;
  status: string; search: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(search);
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input placeholder="Search advertisers…" value={q} onChange={e => setQ(e.target.value)}
          onKeyDown={e => e.key === "Enter" && push({ search: q, page: 1 })} className="w-64" />
        <Select defaultValue={status} onChange={e => push({ status: e.target.value, page: 1 })}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="suspended">Suspended</option>
        </Select>
        <span className="ml-auto text-sm text-gray-500">{total} advertisers</span>
      </div>

      <div className="overflow-x-auto rounded-md border border-border bg-surface">
        <table className="min-w-full text-sm">
          <thead className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              {["Name", "Contact", "Merchant", "Campaigns", "Status", "Since", "Actions"].map(h => (
                <th key={h} className="whitespace-nowrap px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {advertisers.length === 0 ? (
              <tr><td colSpan={7} className="py-12 text-center text-gray-400">No advertisers found.</td></tr>
            ) : advertisers.map(a => (
              <tr key={a.id} className="hover:bg-surface-muted/50">
                <td className="px-4 py-3 font-medium text-gray-900">{a.name}</td>
                <td className="px-4 py-3 text-gray-600">
                  <div>{a.contactName}</div>
                  <div className="text-xs text-gray-400">{a.contactEmail}</div>
                </td>
                <td className="px-4 py-3 text-gray-600">{a.merchantName ?? <span className="text-gray-400">external</span>}</td>
                <td className="px-4 py-3 text-gray-600">{a.campaignCount}</td>
                <td className="px-4 py-3">
                  <Badge tone={STATUS_TONES[a.status] ?? "neutral"} variant="soft" className="capitalize text-xs">{a.status}</Badge>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{new Date(a.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {a.status !== "approved" && (
                      <Button size="xs" onClick={() => run(a.id, approveAdvertiser)} disabled={loadingId === a.id}>Approve</Button>
                    )}
                    {a.status !== "suspended" && (
                      <Button size="xs" variant="ghost" className="text-red-600" onClick={() => run(a.id, suspendAdvertiser)} disabled={loadingId === a.id}>Suspend</Button>
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
