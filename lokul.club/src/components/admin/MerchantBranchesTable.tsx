"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition, useState } from "react";
import { GitBranch } from "lucide-react";
import { Badge, Button, EmptyState, Input, Pagination } from "@/components/ui";

type MerchantBranchRow = {
  id: string; name: string; city: string; pinCode: string; isActive: boolean; createdAt: string;
  merchant: { id: string; name: string };
};

export default function MerchantBranchesTable({
  branches, total, pages, page, search,
}: {
  branches: MerchantBranchRow[];
  total:    number;
  pages:    number;
  page:     number;
  search:   string;
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
          placeholder="Search branch, city, merchant…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && push({ search: q, page: 1 })}
          className="w-72"
        />
        {search && (
          <Button size="xs" variant="ghost" onClick={() => push({ search: undefined, page: 1 })}>
            Clear
          </Button>
        )}
      </div>

      <p className="text-xs text-gray-400">
        {total.toLocaleString()} branch{total !== 1 ? "es" : ""}
        {isPending && " · Loading…"}
      </p>

      <div className="overflow-x-auto rounded-[6px] border border-border bg-surface shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3 text-left">Merchant</th>
              <th className="px-4 py-3 text-left">Branch</th>
              <th className="px-4 py-3 text-left">Location</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Added</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {branches.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10">
                  <EmptyState
                    icon={<GitBranch size={28} />}
                    title="No branches"
                    description="No merchant branches match your filter."
                  />
                </td>
              </tr>
            ) : (
              branches.map((b) => (
                <tr key={b.id} className="hover:bg-surface-muted">
                  <td className="px-4 py-3 font-medium">{b.merchant.name}</td>
                  <td className="px-4 py-3">{b.name}</td>
                  <td className="px-4 py-3 text-gray-500">{b.city} <span className="font-mono text-xs">{b.pinCode}</span></td>
                  <td className="px-4 py-3">
                    <Badge tone={b.isActive ? "success" : "neutral"} variant="soft" size="sm">
                      {b.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(b.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
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
