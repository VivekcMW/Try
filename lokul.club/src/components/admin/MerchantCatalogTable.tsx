"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition, useState } from "react";
import { Package } from "lucide-react";
import { Badge, Button, EmptyState, Input, Pagination, Select } from "@/components/ui";

type MerchantCatalogItemRow = {
  id: string; name: string; kind: string; pricePaise: number;
  isAvailable: boolean; stockCount: number | null; createdAt: string;
  merchant: { id: string; name: string };
};

const KIND_OPTIONS = [
  { value: "",             label: "All kinds" },
  { value: "product",      label: "Product" },
  { value: "menu_item",    label: "Menu Item" },
  { value: "service",      label: "Service" },
  { value: "consultation", label: "Consultation" },
  { value: "class_batch",  label: "Class Batch" },
];

export default function MerchantCatalogTable({
  items, total, pages, page, search, kind,
}: {
  items:  MerchantCatalogItemRow[];
  total:  number;
  pages:  number;
  page:   number;
  search: string;
  kind:   string;
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
          placeholder="Search item or merchant…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && push({ search: q, page: 1 })}
          className="w-72"
        />
        <Select value={kind} onChange={(e) => push({ kind: e.target.value, page: 1 })}>
          {KIND_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
        {(search || kind) && (
          <Button size="xs" variant="ghost" onClick={() => push({ search: undefined, kind: undefined, page: 1 })}>
            Clear
          </Button>
        )}
      </div>

      <p className="text-xs text-gray-400">
        {total.toLocaleString()} catalog item{total !== 1 ? "s" : ""}
        {isPending && " · Loading…"}
      </p>

      <div className="overflow-x-auto rounded-md border border-border bg-surface shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3 text-left">Item</th>
              <th className="px-4 py-3 text-left">Merchant</th>
              <th className="px-4 py-3 text-left">Kind</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3 text-right">Stock</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10">
                  <EmptyState
                    icon={<Package size={28} />}
                    title="No catalog items"
                    description="No merchant catalog items match your filter."
                  />
                </td>
              </tr>
            ) : (
              items.map((c) => (
                <tr key={c.id} className="hover:bg-surface-muted">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3">{c.merchant.name}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 capitalize">{c.kind.replace("_", " ")}</td>
                  <td className="px-4 py-3 text-right text-gray-600">₹{(c.pricePaise / 100).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right text-gray-500">{c.stockCount ?? "∞"}</td>
                  <td className="px-4 py-3">
                    <Badge tone={c.isAvailable ? "success" : "neutral"} variant="soft" size="sm">
                      {c.isAvailable ? "Available" : "Unavailable"}
                    </Badge>
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
