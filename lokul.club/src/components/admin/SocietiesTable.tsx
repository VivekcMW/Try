"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition, useState } from "react";
import { Search, Building2 } from "lucide-react";
import { Badge, Button, EmptyState, Input, Pagination, Select } from "@/components/ui";
import { approveSociety, rejectSociety } from "@/app/admin/societies/actions";
import type { AdminSociety } from "@/lib/admin-platform";

const STATUS_TONES: Record<string, "warning" | "success" | "danger" | "neutral"> = {
  pending: "warning", approved: "success", rejected: "danger",
};

export default function SocietiesTable({
  societies, total, pages, page, search, status,
}: {
  societies: AdminSociety[];
  total:     number;
  pages:     number;
  page:      number;
  search:    string;
  status:    string;
}) {
  const router   = useRouter();
  const pathname = usePathname();
  const params   = useSearchParams();
  const [isPending, startTransition]   = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);

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

  async function handleApprove(id: string) {
    setLoadingId(id);
    await approveSociety(id);
    setLoadingId(null);
  }

  async function handleReject(id: string) {
    setLoadingId(id);
    await rejectSociety(id);
    setLoadingId(null);
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="w-full max-w-xs">
          <Input
            defaultValue={search}
            placeholder="Search name, city, pin…"
            leftIcon={<Search size={14} />}
            onChange={(e) => push({ search: e.target.value, page: 1 })}
          />
        </div>
        <Select defaultValue={status} onChange={(e) => push({ status: e.target.value, page: 1 })}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </Select>
      </div>

      <p className="text-xs text-gray-400">
        {total.toLocaleString()} {total === 1 ? "society" : "societies"}
        {(search || status) ? " matching filters" : " total"}
        {isPending && " · Loading…"}
      </p>

      {/* Table */}
      <div className="overflow-x-auto rounded-[6px] border border-border bg-surface shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Location</th>
              <th className="px-4 py-3 text-left">Pin</th>
              <th className="px-4 py-3 text-right">Members</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Requested</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {societies.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10">
                  <EmptyState
                    icon={<Building2 size={28} />}
                    title="No societies found"
                    description={(search || status) ? "Try adjusting your filters." : "No society registrations yet."}
                  />
                </td>
              </tr>
            ) : (
              societies.map((s) => (
                <tr key={s.id} className="transition-colors hover:bg-surface-muted">
                  <td className="px-4 py-3 font-medium text-foreground">{s.name}</td>
                  <td className="px-4 py-3 text-gray-500">{s.city}, {s.state}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{s.pinCode}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{s.memberCount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONES[s.status] ?? "neutral"} variant="soft" size="sm">
                      {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(s.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    {s.status === "pending" && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="xs" variant="secondary"
                          loading={loadingId === s.id}
                          onClick={() => handleApprove(s.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="xs" variant="destructive"
                          loading={loadingId === s.id}
                          onClick={() => handleReject(s.id)}
                        >
                          Reject
                        </Button>
                      </div>
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
