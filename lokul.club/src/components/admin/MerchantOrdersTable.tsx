"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { Badge, Button, EmptyState, Input, Pagination, Select } from "@/components/ui";

type MerchantOrderRow = {
  id: string; orderNumber: string; status: string; paymentStatus: string;
  totalPaise: number; createdAt: string;
  customer: { id: string; name: string };
  merchant: { id: string; name: string };
};

const STATUS_OPTIONS = [
  { value: "",          label: "All Statuses" },
  { value: "pending",   label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "disputed",  label: "Disputed" },
];

function statusTone(s: string): "neutral" | "success" | "warning" | "danger" {
  if (s === "completed" || s === "confirmed") return "success";
  if (s === "pending" || s === "in_progress") return "warning";
  if (s === "cancelled" || s === "disputed") return "danger";
  return "neutral";
}

export default function MerchantOrdersTable({
  orders, total, pages, page, search, status,
}: {
  orders: MerchantOrderRow[];
  total:  number;
  pages:  number;
  page:   number;
  search: string;
  status: string;
}) {
  const router   = useRouter();
  const pathname = usePathname();
  const params   = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [q, setQ] = useState(search);

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
          placeholder="Search order #, customer, merchant…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && push({ search: q, page: 1 })}
          className="w-72"
        />
        <Select value={status} onChange={(e) => push({ status: e.target.value, page: 1 })}>
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
        {(search || status) && (
          <Button size="xs" variant="ghost" onClick={() => push({ search: undefined, status: undefined, page: 1 })}>
            Clear
          </Button>
        )}
      </div>

      <p className="text-xs text-gray-400">
        {total.toLocaleString()} order{total !== 1 ? "s" : ""}
        {isPending && " · Loading…"}
      </p>

      <div className="overflow-x-auto rounded-[6px] border border-border bg-surface shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3 text-left">Order</th>
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-left">Merchant</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-left">Payment</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Placed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10">
                  <EmptyState
                    icon={<ShoppingBag size={28} />}
                    title="No merchant orders"
                    description="No orders match your filter."
                  />
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="hover:bg-surface-muted">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{o.orderNumber}</td>
                  <td className="px-4 py-3 font-medium">{o.customer.name}</td>
                  <td className="px-4 py-3">{o.merchant.name}</td>
                  <td className="px-4 py-3 text-right text-gray-600">₹{(o.totalPaise / 100).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 capitalize">{o.paymentStatus}</td>
                  <td className="px-4 py-3">
                    <Badge tone={statusTone(o.status)} variant="soft" size="sm">
                      {o.status.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <Pagination page={page} pageCount={pages} onPageChange={(n: number) => push({ page: n })} />
      )}
    </div>
  );
}
