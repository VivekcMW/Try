"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition, useState } from "react";
import { UsersRound } from "lucide-react";
import { dissolveCommunity } from "@/app/admin/communities/actions";
import { Badge, Button, EmptyState, Input, Pagination, Select } from "@/components/ui";

type CommunityRow = {
  id: string;
  name: string;
  type: string;
  joinPolicy: string;
  memberCount: number;
  isActive: boolean;
  createdAt: string;
  createdBy: { id: string; name: string };
  _count: { members: number };
};

export default function AdminCommunitiesTable({
  communities, total, pages, page, type, search,
}: {
  communities: CommunityRow[];
  total:  number;
  pages:  number;
  page:   number;
  type:   string;
  search: string;
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
          placeholder="Search communities…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && push({ search: q, page: 1 })}
          className="w-64"
        />
        <Select defaultValue={type} onChange={(e) => push({ type: e.target.value, page: 1 })}>
          <option value="">All types</option>
          <option value="interest">Interest</option>
          <option value="activity">Activity</option>
          <option value="parenting">Parenting</option>
          <option value="cultural">Cultural</option>
          <option value="buying">Buying</option>
          <option value="professional">Professional</option>
          <option value="cause">Cause</option>
          <option value="pets">Pets</option>
          <option value="business">Business</option>
        </Select>
        {(type || search) && (
          <Button size="xs" variant="ghost" onClick={() => push({ type: undefined, search: undefined, page: 1 })}>
            Clear
          </Button>
        )}
      </div>

      <p className="text-xs text-gray-400">
        {total.toLocaleString()} communities{isPending && " · Loading…"}
      </p>

      <div className="overflow-x-auto rounded-[6px] border border-border bg-surface shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Join Policy</th>
              <th className="px-4 py-3 text-right">Members</th>
              <th className="px-4 py-3 text-left">Creator</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Created</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {communities.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10">
                  <EmptyState icon={<UsersRound size={28} />} title="No communities" description="No communities match your filters." />
                </td>
              </tr>
            ) : (
              communities.map((c) => (
                <tr key={c.id} className="hover:bg-surface-muted">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3">
                    <Badge tone="neutral" variant="soft" size="sm" className="capitalize">{c.type}</Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 capitalize">{c.joinPolicy.replace("_", " ")}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{c.memberCount}</td>
                  <td className="px-4 py-3 text-gray-500">{c.createdBy?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge tone={c.isActive ? "success" : "danger"} variant="soft" size="sm">
                      {c.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </td>
                  <td className="px-4 py-3">
                    {c.isActive && <Button size="sm" variant="destructive" onClick={() => run(c.id, dissolveCommunity)} disabled={loadingId === c.id} className="text-xs">Dissolve</Button>}
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
