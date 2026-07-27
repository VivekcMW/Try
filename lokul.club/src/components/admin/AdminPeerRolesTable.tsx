"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition, useState } from "react";
import { BadgeCheck, CheckCircle, XCircle } from "lucide-react";
import { Badge, Button, EmptyState, Pagination, Select } from "@/components/ui";

type ListingRow = {
  id: string;
  title: string;
  category: string;
  pricePaise: number;
  isActive: boolean;
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
  user: { id: string; name: string; phone: string; kycTier: string };
  _count: { orders: number; ratings: number };
};

export default function AdminPeerRolesTable({
  listings, total, pages, page, status, category,
}: {
  listings: ListingRow[];
  total:    number;
  pages:    number;
  page:     number;
  status:   string;
  category: string;
}) {
  const router   = useRouter();
  const pathname = usePathname();
  const params   = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId]    = useState<string | null>(null);

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

  async function handleToggle(listingId: string, action: "activate" | "suspend") {
    setLoadingId(listingId);
    await fetch("/api/admin/peer-roles", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, action }),
    });
    setLoadingId(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Select defaultValue={status} onChange={(e) => push({ status: e.target.value, page: 1 })}>
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>
        <Select defaultValue={category} onChange={(e) => push({ category: e.target.value, page: 1 })}>
          <option value="">All categories</option>
          <option value="cook">Cook</option>
          <option value="rider">Rider</option>
          <option value="coach">Coach</option>
          <option value="tutor">Tutor</option>
          <option value="beautician">Beautician</option>
          <option value="caretaker">Caretaker</option>
          <option value="handyman">Handyman</option>
          <option value="reseller">Reseller</option>
        </Select>
        {(status || category) && (
          <Button size="xs" variant="ghost" onClick={() => push({ status: undefined, category: undefined, page: 1 })}>Clear</Button>
        )}
      </div>

      <p className="text-xs text-gray-400">{total.toLocaleString()} listings{isPending && " · Loading…"}</p>

      <div className="overflow-x-auto rounded-[6px] border border-border bg-surface shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3 text-left">Service</th>
              <th className="px-4 py-3 text-left">Provider</th>
              <th className="px-4 py-3 text-left">KYC</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-right">Price/hr</th>
              <th className="px-4 py-3 text-right">Orders</th>
              <th className="px-4 py-3 text-right">Rating</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {listings.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10">
                  <EmptyState icon={<BadgeCheck size={28} />} title="No listings" description="No peer role listings match your filters." />
                </td>
              </tr>
            ) : (
              listings.map((l) => (
                <tr key={l.id} className="hover:bg-surface-muted">
                  <td className="px-4 py-3 font-medium">{l.title}</td>
                  <td className="px-4 py-3">
                    <p className="text-gray-700">{l.user.name}</p>
                    <p className="text-xs text-gray-400">{l.user.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone="neutral" variant="soft" size="sm" className="uppercase">{l.user.kycTier}</Badge>
                  </td>
                  <td className="px-4 py-3 capitalize text-gray-500">{l.category}</td>
                  <td className="px-4 py-3 text-right text-gray-600">₹{(l.pricePaise / 100).toFixed(0)}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{l._count.orders}</td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {l.ratingCount > 0 ? `${l.ratingAvg.toFixed(1)} (${l.ratingCount})` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={l.isActive ? "success" : "danger"} variant="soft" size="sm">
                      {l.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {l.isActive ? (
                      <Button size="xs" variant="destructive" leftIcon={<XCircle size={11} />}
                        loading={loadingId === l.id}
                        onClick={() => handleToggle(l.id, "suspend")}>
                        Suspend
                      </Button>
                    ) : (
                      <Button size="xs" variant="primary" leftIcon={<CheckCircle size={11} />}
                        loading={loadingId === l.id}
                        onClick={() => handleToggle(l.id, "activate")}>
                        Activate
                      </Button>
                    )}
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
