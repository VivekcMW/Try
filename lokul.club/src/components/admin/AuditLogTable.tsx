"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Search, ScrollText } from "lucide-react";
import { Badge, EmptyState, Input, Pagination } from "@/components/ui";
import type { AdminAuditLog } from "@/lib/admin-platform";

function actionTone(action: string): "brand" | "success" | "warning" | "danger" | "neutral" {
  if (action.includes("approved") || action.includes("created")) return "success";
  if (action.includes("suspended") || action.includes("warned"))  return "warning";
  if (action.includes("banned")    || action.includes("removed") || action.includes("rejected")) return "danger";
  if (action.includes("dismissed") || action.includes("expired")) return "neutral";
  return "brand";
}

export default function AuditLogTable({
  logs, total, pages, page, action,
}: {
  logs:   AdminAuditLog[];
  total:  number;
  pages:  number;
  page:   number;
  action: string;
}) {
  const router   = useRouter();
  const pathname = usePathname();
  const params   = useSearchParams();
  const [isPending, startTransition] = useTransition();

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
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="w-full max-w-xs">
          <Input
            defaultValue={action}
            placeholder="Filter by action name…"
            leftIcon={<Search size={14} />}
            onChange={(e) => push({ action: e.target.value, page: 1 })}
          />
        </div>
      </div>

      <p className="text-xs text-gray-400">
        {total.toLocaleString()} {total === 1 ? "entry" : "entries"}
        {action ? " matching filters" : " total"}
        {isPending && " · Loading…"}
      </p>

      {/* Table */}
      <div className="overflow-x-auto rounded-[6px] border border-border bg-surface shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3 text-left">Timestamp</th>
              <th className="px-4 py-3 text-left">Actor</th>
              <th className="px-4 py-3 text-left">Action</th>
              <th className="px-4 py-3 text-left">Target</th>
              <th className="px-4 py-3 text-left">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10">
                  <EmptyState
                    icon={<ScrollText size={28} />}
                    title="No log entries"
                    description={action ? "No entries match this filter." : "The audit log is empty."}
                  />
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="transition-colors hover:bg-surface-muted">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    {log.actorId
                      ? <span className="font-mono text-xs text-gray-600">{log.actorId.slice(-8)}</span>
                      : <Badge tone="neutral" variant="soft" size="sm">system</Badge>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={actionTone(log.action)} variant="soft" size="sm">
                      {log.action}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {log.targetKind && (
                      <span>
                        <span className="capitalize">{log.targetKind}</span>
                        {log.targetId && (
                          <span className="ml-1 font-mono text-xs text-gray-400">#{log.targetId.slice(-6)}</span>
                        )}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">
                    {log.ipAddress ?? "—"}
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
