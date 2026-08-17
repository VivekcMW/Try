"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition, useState } from "react";
import { Tag } from "lucide-react";
import { Badge, Button, EmptyState, Input, Pagination, Select } from "@/components/ui";

type MerchantOfferRow = {
  id: string; title: string; type: string; value: number;
  isActive: boolean; startsAt: string; endsAt: string; createdAt: string;
  merchant: { id: string; name: string };
};

function offerValueLabel(o: MerchantOfferRow): string {
  if (o.type === "percent_off") return `${o.value}% off`;
  if (o.type === "flat_off") return `₹${(o.value / 100).toLocaleString("en-IN")} off`;
  if (o.type === "bogo") return "Buy one, get one";
  return "Free delivery";
}

export default function MerchantOffersTable({
  offers, total, pages, page, search, active,
}: {
  offers: MerchantOfferRow[];
  total:  number;
  pages:  number;
  page:   number;
  search: string;
  active: string;
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
          placeholder="Search offer or merchant…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && push({ search: q, page: 1 })}
          className="w-72"
        />
        <Select value={active} onChange={(e) => push({ active: e.target.value, page: 1 })}>
          <option value="">All offers</option>
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
        {total.toLocaleString()} offer{total !== 1 ? "s" : ""}
        {isPending && " · Loading…"}
      </p>

      <div className="overflow-x-auto rounded-md border border-border bg-surface shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3 text-left">Offer</th>
              <th className="px-4 py-3 text-left">Merchant</th>
              <th className="px-4 py-3 text-left">Discount</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Ends</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {offers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10">
                  <EmptyState
                    icon={<Tag size={28} />}
                    title="No offers"
                    description="No merchant offers match your filter."
                  />
                </td>
              </tr>
            ) : (
              offers.map((o) => (
                <tr key={o.id} className="hover:bg-surface-muted">
                  <td className="px-4 py-3 font-medium">{o.title}</td>
                  <td className="px-4 py-3">{o.merchant.name}</td>
                  <td className="px-4 py-3 text-gray-600">{offerValueLabel(o)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={o.isActive ? "success" : "neutral"} variant="soft" size="sm">
                      {o.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(o.endsAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
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
