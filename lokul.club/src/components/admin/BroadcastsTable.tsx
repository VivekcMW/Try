"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition, useState } from "react";
import { Megaphone, Plus, Send } from "lucide-react";
import { Badge, Button, EmptyState, FormField, Input, Modal, Pagination, Select, Textarea } from "@/components/ui";
import { createBroadcast, sendBroadcast, cancelBroadcast } from "@/app/admin/broadcasts/actions";
import type { AdminBroadcast } from "@/lib/admin-platform";

const STATUS_TONES: Record<string, "neutral" | "success" | "warning" | "danger"> = {
  draft: "neutral", sent: "success", cancelled: "danger",
};

export default function BroadcastsTable({
  broadcasts, total, pages, page, status,
}: {
  broadcasts: AdminBroadcast[];
  total:      number;
  pages:      number;
  page:       number;
  status:     string;
}) {
  const router   = useRouter();
  const pathname = usePathname();
  const params   = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [composing, setComposing] = useState(false);
  const [title, setTitle]         = useState("");
  const [body, setBody]           = useState("");
  const [scope, setScope]         = useState("all");
  const [submitting, setSubmitting] = useState(false);
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

  async function handleCreate() {
    setSubmitting(true);
    const fd = new FormData();
    fd.set("title", title);
    fd.set("body", body);
    fd.set("targetScope", scope);
    await createBroadcast(fd);
    setSubmitting(false);
    setComposing(false);
    setTitle(""); setBody(""); setScope("all");
  }

  async function handleSend(id: string) {
    setLoadingId(id);
    await sendBroadcast(id);
    setLoadingId(null);
  }

  async function handleCancel(id: string) {
    setLoadingId(id);
    await cancelBroadcast(id);
    setLoadingId(null);
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Select defaultValue={status} onChange={(e) => push({ status: e.target.value, page: 1 })}>
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </div>
        <Button size="sm" variant="primary" leftIcon={<Plus size={14} />} onClick={() => setComposing(true)}>
          New broadcast
        </Button>
      </div>

      <p className="text-xs text-gray-400">
        {total.toLocaleString()} {total === 1 ? "broadcast" : "broadcasts"}
        {status ? " matching filters" : " total"}
        {isPending && " · Loading…"}
      </p>

      {/* Table */}
      <div className="overflow-x-auto rounded-[6px] border border-border bg-surface shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Scope</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Recipients</th>
              <th className="px-4 py-3 text-left">Sent at</th>
              <th className="px-4 py-3 text-left">Created</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {broadcasts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10">
                  <EmptyState
                    icon={<Megaphone size={28} />}
                    title="No broadcasts"
                    description="Create your first broadcast to notify users."
                  />
                </td>
              </tr>
            ) : (
              broadcasts.map((b) => (
                <tr key={b.id} className="transition-colors hover:bg-surface-muted">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{b.title}</p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-gray-400">{b.body}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{b.targetScope}</td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONES[b.status] ?? "neutral"} variant="soft" size="sm">
                      {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">{b.recipientCount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-400">
                    {b.sentAt
                      ? new Date(b.sentAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(b.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    {b.status === "draft" && (
                      <div className="flex items-center gap-2">
                        <Button size="xs" variant="primary" leftIcon={<Send size={11} />}
                          loading={loadingId === b.id}
                          onClick={() => handleSend(b.id)}>
                          Send
                        </Button>
                        <Button size="xs" variant="destructive"
                          loading={loadingId === b.id}
                          onClick={() => handleCancel(b.id)}>
                          Cancel
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

      {/* Compose modal */}
      <Modal
        open={composing}
        onClose={() => { setComposing(false); setTitle(""); setBody(""); setScope("all"); }}
        title="New broadcast"
        description="Message will be sent as a push notification to the selected audience."
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => { setComposing(false); setTitle(""); setBody(""); setScope("all"); }}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" loading={submitting}
              disabled={!title.trim() || !body.trim()}
              onClick={handleCreate}>
              Save as draft
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <FormField label="Title">
            <Input
              placeholder="e.g. Scheduled maintenance tonight"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </FormField>

          <FormField label="Message">
            <Textarea
              rows={4}
              placeholder="Write your notification message…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </FormField>

          <FormField label="Audience scope">
            <Select value={scope} onChange={(e) => setScope(e.target.value)}>
              <option value="all">All users</option>
              <option value="city:bengaluru">City — Bengaluru</option>
              <option value="city:mumbai">City — Mumbai</option>
              <option value="city:hyderabad">City — Hyderabad</option>
            </Select>
          </FormField>
        </div>
      </Modal>
    </div>
  );
}
