"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition, useState } from "react";
import { Package } from "lucide-react";
import { cancelGroupBuy } from "@/app/admin/group-buys/actions";
import { Badge, Button, EmptyState, Pagination, Select } from "@/components/ui";

type GroupBuyRow = {
  id: string;
  title: string;
  status: string;
  pricePaise: number;
  unit: string;
  minQty: number;
  targetQty: number;
  currentQty: number;
  closesAt: string;
  createdAt: string;
  organizer: { id: string; name: string; phone: string | null };
  _count: { commits: number };
};

const STATUS_TONES: Record<string, "neutral" | "success" | "warning" | "danger"> = {
  open: "neutral", locked: "warning", distributing: "success",
  completed: "success", cancelled: "danger",
};

export default function AdminGroupBuysTable({
  buys, total, pages, page, status,
}: {
  buys:   GroupBuyRow[];
  total:  number;
  pages:  number;
  page:   number;
  status: string;
}) {
  const router   = useRouter();
  const pathname = usePathname();
  const params   = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  async function run(id: string, fn: (id: string) => Promise<void>) {
    setLoadingId(id); await fn(id); setLoadingId(null); router.refresh();
  }

  const push = useCallback(
    (updates: Record<string, string | number | undefined>) => {
      const next = new URLSearchParams(params.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v === undefined || v === "") next.delete(k);
        else next.set(k, String(v));
      });
      startTransition(() => router.push(`${pathname}?${next}`));
    },
    [params, pathname, router]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Select defaultValue={status} onChange={(e) => push({ status: e.target.value, page: 1 })}>
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="locked">Locked</option>
          <option value="distributing">Distributing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </Select>
        {status && (
          <Button size="xs" variant="ghost" onClick={() => push({ status: undefined, page: 1 })}>Clear</Button>
        )}
      </div>

      <p className="text-xs text-gray-400">{total.toLocaleString()} group buys{isPending && " · Loading…"}</p>

      <div className="overflow-x-auto rounded-[6px] border border-border bg-surface shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Organizer</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3 text-right">Qty (curr/min/target)</th>
              <th className="px-4 py-3 text-right">Commits</th>
              <th className="px-4 py-3 text-left">Closes</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {buys.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10">
                  <EmptyState icon={<Package size={28} />} title="No group buys" description="No group buys match your filters." />
                </td>
              </tr>
            ) : (
              buys.map((b) => (
                <tr key={b.id} className="hover:bg-surface-muted">
                  <td className="px-4 py-3 font-medium">{b.title}</td>
                  <td className="px-4 py-3 text-gray-500">{b.organizer.name}</td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONES[b.status] ?? "neutral"} variant="soft" size="sm" className="capitalize">{b.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">₹{(b.pricePaise / 100).toFixed(0)}/{b.unit}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{b.currentQty}/{b.minQty}/{b.targetQty}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{b._count.commits}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(b.closesAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="destructive" onClick={() => run(b.id, cancelGroupBuy)} disabled={loadingId === b.id} className="text-xs">Cancel</Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <Pagination page={page} pageCount={pages} onPageChange={(p) => push({ page: p })} />
      )}
    </div>
  );
}
