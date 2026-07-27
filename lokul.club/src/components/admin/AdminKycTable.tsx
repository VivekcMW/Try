"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition, useState } from "react";
import { FileCheck, Eye, CheckCircle, XCircle } from "lucide-react";
import { Badge, Button, EmptyState, Pagination, Select } from "@/components/ui";

type KycDocRow = {
  id: string;
  kind: string;
  status: string;
  fileKey: string;
  reviewNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string; phone: string; kycTier: string };
};

const STATUS_TONES: Record<string, "neutral" | "success" | "danger"> = {
  pending: "neutral", approved: "success", rejected: "danger",
};

export default function AdminKycTable({
  docs, total, pages, page, status,
}: {
  docs:   KycDocRow[];
  total:  number;
  pages:  number;
  page:   number;
  status: string;
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

  async function handleAction(docId: string, action: "approve" | "reject") {
    const note = action === "reject" ? prompt("Rejection reason:") : undefined;
    if (action === "reject" && !note) return;
    setLoadingId(docId);
    await fetch("/api/admin/kyc", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ docId, action, reviewNote: note, reviewedBy: "admin" }),
    });
    setLoadingId(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Select defaultValue={status} onChange={(e) => push({ status: e.target.value, page: 1 })}>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </Select>
      </div>

      <p className="text-xs text-gray-400">{total.toLocaleString()} documents{isPending && " · Loading…"}</p>

      <div className="overflow-x-auto rounded-[6px] border border-border bg-surface shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">KYC Tier</th>
              <th className="px-4 py-3 text-left">Document</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Note</th>
              <th className="px-4 py-3 text-left">Submitted</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {docs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10">
                  <EmptyState icon={<FileCheck size={28} />} title="No documents" description="No KYC documents match your filters." />
                </td>
              </tr>
            ) : (
              docs.map((d) => (
                <tr key={d.id} className="hover:bg-surface-muted">
                  <td className="px-4 py-3">
                    <p className="font-medium">{d.user.name}</p>
                    <p className="text-xs text-gray-400">{d.user.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone="neutral" variant="soft" size="sm" className="uppercase">{d.user.kycTier}</Badge>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono uppercase text-gray-500">{d.kind}</td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONES[d.status] ?? "neutral"} variant="soft" size="sm" className="capitalize">{d.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 max-w-[160px] truncate">{d.reviewNote ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(d.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Button size="xs" variant="ghost" leftIcon={<Eye size={11} />}
                        onClick={() => window.open(`/api/admin/kyc/file?key=${d.fileKey}`, "_blank")}>
                        View
                      </Button>
                      {d.status === "pending" && (
                        <>
                          <Button size="xs" variant="primary" leftIcon={<CheckCircle size={11} />}
                            loading={loadingId === d.id}
                            onClick={() => handleAction(d.id, "approve")}>
                            Approve
                          </Button>
                          <Button size="xs" variant="destructive" leftIcon={<XCircle size={11} />}
                            loading={loadingId === d.id}
                            onClick={() => handleAction(d.id, "reject")}>
                            Reject
                          </Button>
                        </>
                      )}
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
