"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition, useState } from "react";
import { Search, Store, ChevronDown } from "lucide-react";
import { Badge, Button, EmptyState, Input, Pagination, Select } from "@/components/ui";
import { approveMerchant, rejectMerchant, suspendMerchant, toggleEndorsement, syncMerchantWorkflow } from "@/app/admin/merchants/actions";
import { getProfileFromCategory, PROFILE_WORKFLOW_CONFIG } from "@/lib/merchant-profiles";
import type { AdminMerchant } from "@/lib/admin-platform";

const STATUS_TONES: Record<string, "warning" | "success" | "danger" | "neutral"> = {
  pending_verification: "warning", active: "success", suspended: "danger", rejected: "neutral",
};
const STATUS_LABELS: Record<string, string> = {
  pending_verification: "Pending", active: "Active", suspended: "Suspended", rejected: "Rejected",
};

function workflowLabel(profile: string): string {
  return PROFILE_WORKFLOW_CONFIG[profile as keyof typeof PROFILE_WORKFLOW_CONFIG]?.label ?? profile;
}

export default function MerchantsTable({
  merchants, total, pages, page, search, status,
}: {
  merchants: AdminMerchant[];
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

  async function run(id: string, fn: (id: string) => Promise<void>) {
    setLoadingId(id);
    await fn(id);
    setLoadingId(null);
  }

  async function runSyncWorkflow(id: string, category: string) {
    setLoadingId(id);
    await syncMerchantWorkflow(id, category);
    setLoadingId(null);
  }

  const workflowIssues = merchants.filter((m) => {
    if (!m.workflowProfile) return true;
    return m.workflowProfile !== getProfileFromCategory(m.category);
  }).length;

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
          <option value="pending_verification">Pending</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="rejected">Rejected</option>
        </Select>
      </div>

      <p className="text-xs text-gray-400">
        {total.toLocaleString()} {total === 1 ? "merchant" : "merchants"}
        {(search || status) ? " matching filters" : " total"}
        {isPending && " · Loading…"}
      </p>
      {workflowIssues > 0 && (
        <p className="text-xs font-medium text-warning">
          {workflowIssues} {workflowIssues === 1 ? "merchant needs" : "merchants need"} workflow review (missing or mismatched profile)
        </p>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-[6px] border border-border bg-surface shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3 text-left">Business</th>
              <th className="px-4 py-3 text-left">Owner</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Location</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Workflow</th>
              <th className="px-4 py-3 text-left">Flags</th>
              <th className="px-4 py-3 text-left">Applied</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {merchants.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10">
                  <EmptyState
                    icon={<Store size={28} />}
                    title="No merchants found"
                    description={(search || status) ? "Try adjusting your filters." : "No merchant registrations yet."}
                  />
                </td>
              </tr>
            ) : (
              merchants.map((m) => (
                <tr key={m.id} className="transition-colors hover:bg-surface-muted">
                  <td className="px-4 py-3 font-medium text-foreground">{m.name}</td>
                  <td className="px-4 py-3 text-gray-500">{m.ownerName}</td>
                  <td className="px-4 py-3 capitalize text-gray-600">{m.category}</td>
                  <td className="px-4 py-3 text-gray-500">{m.city} <span className="font-mono text-xs">{m.pinCode}</span></td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONES[m.status] ?? "neutral"} variant="soft" size="sm">
                      {STATUS_LABELS[m.status] ?? m.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {(() => {
                      const expected = getProfileFromCategory(m.category);
                      if (!m.workflowProfile) {
                        return (
                          <div className="flex items-center gap-1.5">
                            <Badge tone="danger" variant="soft" size="sm" title={`Expected: ${workflowLabel(expected)}`}>
                              Missing
                            </Badge>
                            <Button size="xs" variant="outline" loading={loadingId === m.id}
                              onClick={() => runSyncWorkflow(m.id, m.category)}>
                              Sync
                            </Button>
                          </div>
                        );
                      }
                      if (m.workflowProfile !== expected) {
                        return (
                          <div className="flex items-center gap-1.5">
                            <Badge tone="warning" variant="soft" size="sm" title={`Expected: ${workflowLabel(expected)}`}>
                              {workflowLabel(m.workflowProfile)} ≠ {workflowLabel(expected)}
                            </Badge>
                            <Button size="xs" variant="outline" loading={loadingId === m.id}
                              onClick={() => runSyncWorkflow(m.id, m.category)}>
                              Sync
                            </Button>
                          </div>
                        );
                      }
                      return (
                        <Badge tone="neutral" variant="soft" size="sm">
                          {workflowLabel(m.workflowProfile)}
                        </Badge>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {m.isEndorsed && (
                        <Badge tone="success" variant="soft" size="sm">Endorsed</Badge>
                      )}
                      {m.isBlacklisted && (
                        <Badge tone="danger" variant="solid" size="sm">Blacklisted</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(m.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative group inline-block">
                      <Button size="xs" variant="outline" rightIcon={<ChevronDown size={12} />}
                        loading={loadingId === m.id}>
                        Manage
                      </Button>
                      <div className="absolute right-0 top-full z-10 mt-1 hidden min-w-[160px] rounded-[6px] border border-border bg-surface py-1 shadow-md group-hover:block">
                        {m.status === "pending_verification" && (
                          <>
                            <button className="w-full px-3 py-2 text-left text-sm text-success hover:bg-surface-muted"
                              onClick={() => run(m.id, approveMerchant)}>Approve</button>
                            <button className="w-full px-3 py-2 text-left text-sm text-danger hover:bg-surface-muted"
                              onClick={() => run(m.id, rejectMerchant)}>Reject</button>
                          </>
                        )}
                        {m.status === "active" && (
                          <>
                            <button className="w-full px-3 py-2 text-left text-sm text-warning hover:bg-surface-muted"
                              onClick={() => run(m.id, suspendMerchant)}>Suspend</button>
                            {!m.isEndorsed && (
                              <button className="w-full px-3 py-2 text-left text-sm text-success hover:bg-surface-muted"
                                onClick={() => run(m.id, (id) => toggleEndorsement(id, true))}>Endorse</button>
                            )}
                            {m.isEndorsed && (
                              <button className="w-full px-3 py-2 text-left text-sm text-gray-600 hover:bg-surface-muted"
                                onClick={() => run(m.id, (id) => toggleEndorsement(id, false))}>Remove endorsement</button>
                            )}
                          </>
                        )}
                        {m.status === "suspended" && (
                          <button className="w-full px-3 py-2 text-left text-sm text-success hover:bg-surface-muted"
                            onClick={() => run(m.id, approveMerchant)}>Reinstate</button>
                        )}
                      </div>
                    </div>
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
