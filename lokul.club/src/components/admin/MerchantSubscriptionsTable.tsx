"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition, useState } from "react";
import { ClipboardList } from "lucide-react";
import { Badge, Button, EmptyState, Input, Pagination, Select } from "@/components/ui";

type MerchantSubscriptionRow = {
  id: string; status: string; quantity: number; startDate: string; createdAt: string;
  plan: { id: string; name: string; pricePaise: number; frequency: string };
  merchant: { id: string; name: string };
  customer: { id: string; name: string };
};

function statusTone(s: string): "neutral" | "success" | "warning" | "danger" {
  if (s === "active") return "success";
  if (s === "paused") return "warning";
  if (s === "cancelled") return "danger";
  return "neutral";
}

export default function MerchantSubscriptionsTable({
  subscriptions, total, pages, page, search, status,
}: {
  subscriptions: MerchantSubscriptionRow[];
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
          placeholder="Search plan, merchant, customer…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && push({ search: q, page: 1 })}
          className="w-72"
        />
        <Select value={status} onChange={(e) => push({ status: e.target.value, page: 1 })}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="cancelled">Cancelled</option>
        </Select>
        {(search || status) && (
          <Button size="xs" variant="ghost" onClick={() => push({ search: undefined, status: undefined, page: 1 })}>
            Clear
          </Button>
        )}
      </div>

      <p className="text-xs text-gray-400">
        {total.toLocaleString()} subscription{total !== 1 ? "s" : ""}
        {isPending && " · Loading…"}
      </p>

      <div className="overflow-x-auto rounded-md border border-border bg-surface shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-left">Merchant</th>
              <th className="px-4 py-3 text-left">Plan</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3 text-left">Frequency</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Started</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {subscriptions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10">
                  <EmptyState
                    icon={<ClipboardList size={28} />}
                    title="No subscriptions"
                    description="No merchant subscriptions match your filter."
                  />
                </td>
              </tr>
            ) : (
              subscriptions.map((s) => (
                <tr key={s.id} className="hover:bg-surface-muted">
                  <td className="px-4 py-3 font-medium">{s.customer.name}</td>
                  <td className="px-4 py-3">{s.merchant.name}</td>
                  <td className="px-4 py-3 text-gray-600">{s.plan.name}{s.quantity > 1 ? ` ×${s.quantity}` : ""}</td>
                  <td className="px-4 py-3 text-right text-gray-600">₹{(s.plan.pricePaise / 100).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 capitalize">{s.plan.frequency}</td>
                  <td className="px-4 py-3">
                    <Badge tone={statusTone(s.status)} variant="soft" size="sm">
                      {s.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(s.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
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
