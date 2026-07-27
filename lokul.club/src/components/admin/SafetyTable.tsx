"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Select, Badge, Button } from "@/components/ui";
import { resolveSafetyAlert } from "@/app/admin/safety/actions";

type Alert = { id: string; authorName: string; body: string; pinCode: string; status: string; createdAt: Date };

const STATUS_TONES: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  active: "danger", hidden: "success", removed: "neutral", deleted: "neutral",
};

// SOS posts use ContentStatus; "active" means open, "hidden" means resolved.
const STATUS_LABELS: Record<string, string> = {
  active: "Open", hidden: "Resolved", removed: "Removed", deleted: "Deleted",
};

export default function SafetyTable({ alerts, status }: { alerts: Alert[]; status: string }) {
  const router = useRouter();
  const sp     = useSearchParams();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  function push(key: string, val: string) {
    const p = new URLSearchParams(sp.toString());
    if (val) p.set(key, val); else p.delete(key);
    router.push(`/admin/safety?${p}`);
  }

  async function run(id: string, fn: (id: string) => Promise<void>) {
    setLoadingId(id);
    await fn(id);
    setLoadingId(null);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Select value={status} onChange={e => push("status", e.target.value)} className="w-36">
          <option value="">All statuses</option>
          {["active","hidden","removed"].map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </Select>
        <span className="ml-auto self-center text-sm text-gray-500">{alerts.length} alerts</span>
      </div>
      <div className="overflow-x-auto rounded-[6px] border border-border bg-surface">
        <table className="min-w-full text-sm">
          <thead className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              {["Author","Message","Pin","Status","Time","Actions"].map(h => (
                <th key={h} className="whitespace-nowrap px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {alerts.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-gray-400">No safety alerts found.</td></tr>
            ) : alerts.map(a => (
              <tr key={a.id} className="hover:bg-surface-muted/50">
                <td className="px-4 py-3 font-medium text-gray-900">{a.authorName}</td>
                <td className="px-4 py-3 text-gray-700 max-w-[220px] truncate">{a.body}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-400">{a.pinCode}</td>
                <td className="px-4 py-3">
                  <Badge tone={STATUS_TONES[a.status] ?? "neutral"} variant="soft" className="text-xs">{STATUS_LABELS[a.status] ?? a.status}</Badge>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{new Date(a.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3">
                  {a.status === "active" && (
                    <Button size="sm" onClick={() => run(a.id, resolveSafetyAlert)}
                      disabled={loadingId === a.id} className="text-xs">Mark Resolved</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
