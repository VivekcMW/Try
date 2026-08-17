"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition, useState } from "react";
import { Ticket } from "lucide-react";
import { Badge, Button, EmptyState, Input, Pagination, Select } from "@/components/ui";

type MerchantCouponRow = {
  id: string; code: string; discountType: string; discountValue: number;
  usedCount: number; maxUsesTotal: number | null; isActive: boolean;
  expiresAt: string | null; createdAt: string;
  merchant: { id: string; name: string };
};

export default function MerchantCouponsTable({
  coupons, total, pages, page, search, active,
}: {
  coupons: MerchantCouponRow[];
  total:   number;
  pages:   number;
  page:    number;
  search:  string;
  active:  string;
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
          placeholder="Search code or merchant…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && push({ search: q, page: 1 })}
          className="w-72"
        />
        <Select value={active} onChange={(e) => push({ active: e.target.value, page: 1 })}>
          <option value="">All coupons</option>
          <option value="1">Active</option>
          <option value="0">Inactive</option>
        </Select>
        {(search || active) && (
          <Button size="xs" variant="ghost" onClick={() => push({ search: undefined, active: undefined, page: 1 })}>
            Clear
          </Button>
        )}
      </div>

      <p className="text-xs text-gray-400">
        {total.toLocaleString()} coupon{total !== 1 ? "s" : ""}
        {isPending && " · Loading…"}
      </p>

      <div className="overflow-x-auto rounded-[6px] border border-border bg-surface shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3 text-left">Code</th>
              <th className="px-4 py-3 text-left">Merchant</th>
              <th className="px-4 py-3 text-left">Discount</th>
              <th className="px-4 py-3 text-right">Used</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Expires</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {coupons.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10">
                  <EmptyState
                    icon={<Ticket size={28} />}
                    title="No coupons"
                    description="No merchant coupons match your filter."
                  />
                </td>
              </tr>
            ) : (
              coupons.map((c) => (
                <tr key={c.id} className="hover:bg-surface-muted">
                  <td className="px-4 py-3 font-mono text-xs font-medium">{c.code}</td>
                  <td className="px-4 py-3">{c.merchant.name}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.discountType === "percent_off" ? `${c.discountValue}% off` : `₹${(c.discountValue / 100).toLocaleString("en-IN")} off`}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {c.usedCount}{c.maxUsesTotal ? ` / ${c.maxUsesTotal}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={c.isActive ? "success" : "neutral"} variant="soft" size="sm">
                      {c.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" }) : "—"}
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
