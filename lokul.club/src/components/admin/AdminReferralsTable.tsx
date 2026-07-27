"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition, useState } from "react";
import { Gift } from "lucide-react";
import { revokeReferral } from "@/app/admin/referrals/actions";
import { Badge, Button, EmptyState, Input, Pagination } from "@/components/ui";

type ReferralRow = {
  id: string;
  referrerId: string;
  referrerName: string;
  refereeId: string | null;
  refereeName: string | null;
  refereePhone: string | null;
  creditPaise: number;
  creditedAt: string | null;
  createdAt: string;
};

export default function AdminReferralsTable({
  referrals, total, pages, page, search,
}: {
  referrals: ReferralRow[];
  total:     number;
  pages:     number;
  page:      number;
  search:    string;
}) {
  const router   = useRouter();
  const pathname = usePathname();
  const params   = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [q, setQ] = useState(search);
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
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search referrer / referee…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && push({ search: q, page: 1 })}
          className="w-64"
        />
        {search && (
          <Button size="xs" variant="ghost" onClick={() => push({ search: undefined, page: 1 })}>
            Clear
          </Button>
        )}
      </div>

      <p className="text-xs text-gray-400">
        {total.toLocaleString()} referrals{isPending && " · Loading…"}
      </p>

      <div className="overflow-x-auto rounded-[6px] border border-border bg-surface shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3 text-left">Referrer</th>
              <th className="px-4 py-3 text-left">Referee</th>
              <th className="px-4 py-3 text-right">Credit (₹)</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Credited At</th>
              <th className="px-4 py-3 text-left">Referred On</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {referrals.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10">
                  <EmptyState icon={<Gift size={28} />} title="No referrals" description="No referral records match your search." />
                </td>
              </tr>
            ) : (
              referrals.map((r) => (
                <tr key={r.id} className="hover:bg-surface-muted">
                  <td className="px-4 py-3 font-medium">{r.referrerName}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {r.refereeName ?? r.refereePhone ?? <span className="italic text-gray-300">Pending signup</span>}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-medium text-gray-700">
                    ₹{(r.creditPaise / 100).toFixed(0)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={r.creditedAt ? "success" : "warning"} variant="soft" size="sm">
                      {r.creditedAt ? "Credited" : "Pending"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {r.creditedAt
                      ? new Date(r.creditedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="destructive" onClick={() => run(r.id, revokeReferral)} disabled={loadingId === r.id} className="text-xs">Revoke</Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <Pagination
          page={page}
          pageCount={pages}
          onPageChange={(n: number) => push({ page: n })}
        />
      )}
    </div>
  );
}
