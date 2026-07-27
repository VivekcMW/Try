"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { Badge, Button, EmptyState, Input, Pagination, Select } from "@/components/ui";
import { cancelOrder, releaseEscrow, refundOrder } from "@/app/admin/orders/actions";

type OrderRow = {
  id: string;
  status: string;
  pricePaise: number;
  createdAt: string;
  completedAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  buyer:   { id: string; name: string; phone: string };
  seller:  { id: string; name: string; phone: string };
  listing: { id: string; title: string; category: string };
  rating:  { score: number } | null;
};

const STATUS_TONES: Record<string, "neutral" | "success" | "warning" | "danger"> = {
  pending: "neutral", confirmed: "warning", in_progress: "warning",
  completed: "success", cancelled: "danger", disputed: "danger",
};

export default function AdminOrdersTable({
  orders, total, pages, page, status, search,
}: {
  orders: OrderRow[];
  total:  number;
  pages:  number;
  page:   number;
  status: string;
  search: string;
}) {
  const router   = useRouter();
  const pathname = usePathname();
  const params   = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [q, setQ] = useState(search);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function run(id: string, fn: (id: string) => Promise<void>) {
    setLoadingId(id);
    await fn(id);
    setLoadingId(null);
    router.refresh();
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
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search buyer, seller or service…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && push({ search: q, page: 1 })}
          className="w-64"
        />
        <Select defaultValue={status} onChange={(e) => push({ status: e.target.value, page: 1 })}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="disputed">Disputed</option>
        </Select>
        {(status || search) && (
          <Button size="xs" variant="ghost" onClick={() => push({ status: undefined, search: undefined, page: 1 })}>
            Clear
          </Button>
        )}
      </div>

      <p className="text-xs text-gray-400">
        {total.toLocaleString()} orders{isPending && " · Loading…"}
      </p>

      <div className="overflow-x-auto rounded-[6px] border border-border bg-surface shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3 text-left">Service</th>
              <th className="px-4 py-3 text-left">Buyer</th>
              <th className="px-4 py-3 text-left">Seller</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-right">Rating</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10">
                  <EmptyState icon={<ShoppingBag size={28} />} title="No orders" description="No orders match your filters." />
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="hover:bg-surface-muted">
                  <td className="px-4 py-3">
                    <p className="font-medium">{o.listing?.title ?? "—"}</p>
                    <p className="text-xs text-gray-400 capitalize">{o.listing?.category ?? ""}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{o.buyer?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{o.seller?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONES[o.status] ?? "neutral"} variant="soft" size="sm">
                      {o.status.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    ₹{(o.pricePaise / 100).toFixed(0)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {o.rating ? `${o.rating.score}/5` : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {["pending","confirmed","in_progress"].includes(o.status) && (
                        <Button size="sm" variant="destructive" className="text-xs"
                          disabled={loadingId === o.id}
                          onClick={() => run(o.id, cancelOrder)}>Cancel</Button>
                      )}
                      {o.status === "completed" && (
                        <Button size="sm" variant="outline" className="text-xs"
                          disabled={loadingId === o.id}
                          onClick={() => run(o.id, releaseEscrow)}>Release</Button>
                      )}
                      {o.status === "disputed" && (
                        <Button size="sm" className="text-xs"
                          disabled={loadingId === o.id}
                          onClick={() => run(o.id, refundOrder)}>Refund</Button>
                      )}
                    </div>
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
