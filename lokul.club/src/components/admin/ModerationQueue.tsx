"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition, useState } from "react";
import { ShieldAlert, ChevronDown } from "lucide-react";
import { Badge, Button, EmptyState, Modal, Pagination, Select, Textarea } from "@/components/ui";
import { takeModAction } from "@/app/admin/moderation/actions";
import type { AdminReport } from "@/lib/admin-platform";

const PRIORITY_TONES: Record<string, "danger" | "warning" | "neutral"> = {
  critical: "danger", high: "warning", normal: "neutral",
};
const STATUS_TONES: Record<string, "warning" | "info" | "success" | "neutral"> = {
  open: "warning", in_review: "info", resolved: "success", dismissed: "neutral",
};
const REASON_LABELS: Record<string, string> = {
  spam: "Spam", harassment: "Harassment", misinformation: "Misinformation",
  nudity: "Nudity", hate_speech: "Hate Speech", violence: "Violence",
  child_safety: "Child Safety", illegal_goods: "Illegal Goods",
  impersonation: "Impersonation", other: "Other",
};
const ACTIONS = [
  { value: "dismiss",    label: "Dismiss",       tone: "neutral"      },
  { value: "warn",       label: "Warn user",      tone: "warning"      },
  { value: "hide",       label: "Hide content",   tone: "warning"      },
  { value: "remove",     label: "Remove content", tone: "danger"       },
  { value: "suspend_7d", label: "Suspend 7 days", tone: "danger"       },
  { value: "ban",        label: "Ban user",       tone: "danger"       },
] as const;

type ActionValue = typeof ACTIONS[number]["value"];

export default function ModerationQueue({
  reports, total, pages, page, status, priority,
}: {
  reports:  AdminReport[];
  total:    number;
  pages:    number;
  page:     number;
  status:   string;
  priority: string;
}) {
  const router   = useRouter();
  const pathname = usePathname();
  const params   = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [actionModal, setActionModal] = useState<{ report: AdminReport; action: ActionValue } | null>(null);
  const [notes, setNotes]   = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  async function handleSubmitAction() {
    if (!actionModal) return;
    setSubmitting(true);
    const fd = new FormData();
    fd.set("reportId",   actionModal.report.id);
    fd.set("action",     actionModal.action);
    fd.set("targetKind", actionModal.report.targetKind);
    fd.set("targetId",   actionModal.report.targetId);
    if (notes) fd.set("internalNotes", notes);
    await takeModAction(fd);
    setSubmitting(false);
    setActionModal(null);
    setNotes("");
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Select defaultValue={status} onChange={(e) => push({ status: e.target.value, page: 1 })}>
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="in_review">In Review</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </Select>

        <Select defaultValue={priority} onChange={(e) => push({ priority: e.target.value, page: 1 })}>
          <option value="">All priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="normal">Normal</option>
        </Select>
      </div>

      <p className="text-xs text-gray-400">
        {total.toLocaleString()} {total === 1 ? "report" : "reports"}
        {(status || priority) ? " matching filters" : " total"}
        {isPending && " · Loading…"}
      </p>

      {/* Table */}
      <div className="overflow-x-auto rounded-[6px] border border-border bg-surface shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3 text-left">Priority</th>
              <th className="px-4 py-3 text-left">Target</th>
              <th className="px-4 py-3 text-left">Reason</th>
              <th className="px-4 py-3 text-left">Reported by</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Received</th>
              <th className="px-4 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {reports.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10">
                  <EmptyState
                    icon={<ShieldAlert size={28} />}
                    title="No reports"
                    description="Nothing in the queue — all clear."
                  />
                </td>
              </tr>
            ) : (
              reports.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-surface-muted">
                  <td className="px-4 py-3">
                    <Badge tone={PRIORITY_TONES[r.priority] ?? "neutral"} variant="solid" size="sm">
                      {r.priority.charAt(0).toUpperCase() + r.priority.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium capitalize text-foreground">{r.targetKind}</span>
                    <span className="ml-1 font-mono text-xs text-gray-400">#{r.targetId.slice(-6)}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{REASON_LABELS[r.reason] ?? r.reason}</td>
                  <td className="px-4 py-3 text-gray-500">{r.reporterName}</td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONES[r.status] ?? "neutral"} variant="soft" size="sm">
                      {r.status.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </td>
                  <td className="px-4 py-3">
                    {(r.status === "open" || r.status === "in_review") && (
                      <div className="relative group inline-block">
                        <Button size="xs" variant="outline" rightIcon={<ChevronDown size={12} />}>
                          Act
                        </Button>
                        <div className="absolute right-0 top-full z-10 mt-1 hidden min-w-[160px] rounded-[6px] border border-border bg-surface py-1 shadow-md group-hover:block">
                          {ACTIONS.map((a) => (
                            <button
                              key={a.value}
                              className={`w-full px-3 py-2 text-left text-sm hover:bg-surface-muted
                                ${a.tone === "danger" ? "text-danger" : a.tone === "warning" ? "text-warning" : "text-gray-700"}`}
                              onClick={() => setActionModal({ report: r, action: a.value })}
                            >
                              {a.label}
                            </button>
                          ))}
                        </div>
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

      {/* Action confirm modal */}
      <Modal
        open={!!actionModal}
        onClose={() => { setActionModal(null); setNotes(""); }}
        title={`Confirm: ${ACTIONS.find(a => a.value === actionModal?.action)?.label}`}
        description={
          actionModal
            ? `Target: ${actionModal.report.targetKind} #${actionModal.report.targetId.slice(-6)}`
            : undefined
        }
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => { setActionModal(null); setNotes(""); }}>
              Cancel
            </Button>
            <Button
              variant={actionModal?.action === "dismiss" ? "secondary" : "destructive"}
              size="sm"
              loading={submitting}
              onClick={handleSubmitAction}
            >
              Confirm
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <Textarea
            rows={3}
            placeholder="Internal notes (optional)…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
}
