"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input, Select, Pagination, Badge, Button } from "@/components/ui";
import type { AdminIncidentReport } from "@/lib/admin-platform";
import { resolveIncidentReport, rejectIncidentReport } from "@/app/admin/incidents/actions";

const SEVERITY_TONE: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  low: "neutral",
  medium: "warning",
  high: "danger",
  critical: "danger",
};

const STATUS_TONE: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  pending: "warning",
  resolved: "success",
  rejected: "neutral",
};

const CATEGORIES = ["noise", "theft", "vandalism", "assault", "fire", "flood", "medical", "other"];

function exportCSV(rows: AdminIncidentReport[]) {
  const data = [
    ["ID", "Title", "Category", "Severity", "Status", "Pin Code", "Author", "Resolved At", "Created"],
    ...rows.map(r => [r.id, r.title, r.category, r.severity, r.status, r.pinCode, r.author.name, r.resolvedAt ? new Date(r.resolvedAt).toISOString() : "", new Date(r.createdAt).toLocaleDateString()]),
  ];
  const csv = data.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = "incidents.csv";
  a.click();
}

export default function IncidentReportsTable({
  reports, total, pages, page, search, status, category,
}: {
  reports: AdminIncidentReport[]; total: number; pages: number; page: number;
  search: string; status: string; category: string;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  function push(key: string, val: string) {
    const p = new URLSearchParams(sp.toString());
    if (val) p.set(key, val); else p.delete(key);
    p.delete("page");
    router.push(`/admin/incidents?${p}`);
  }

  async function run(id: string, fn: (id: string) => Promise<void>) {
    setLoadingId(id);
    await fn(id);
    setLoadingId(null);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Search title, author, pin…"
          defaultValue={search}
          className="w-56"
          onChange={e => push("search", e.target.value)}
        />
        <Select value={status} onChange={e => push("status", e.target.value)} className="w-32">
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </Select>
        <Select value={category} onChange={e => push("category", e.target.value)} className="w-36">
          <option value="">All categories</option>
          {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
        </Select>
        <Button variant="outline" size="sm" onClick={() => exportCSV(reports)}>Export CSV</Button>
        <span className="ml-auto self-center text-sm text-gray-500">{total} incidents</span>
      </div>

      <div className="overflow-x-auto rounded-[6px] border border-border bg-surface">
        <table className="min-w-full text-sm">
          <thead className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              {["Title", "Category", "Severity", "Pin", "Status", "Author", "Reported", "Actions"].map(h => (
                <th key={h} className="whitespace-nowrap px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {reports.length === 0 ? (
              <tr><td colSpan={8} className="py-12 text-center text-gray-400">No incident reports found.</td></tr>
            ) : reports.map(r => (
              <tr key={r.id} className="hover:bg-surface-muted/50">
                <td className="px-4 py-3 font-medium text-gray-900 max-w-[180px] truncate">{r.title}</td>
                <td className="px-4 py-3 capitalize text-gray-600">{r.category}</td>
                <td className="px-4 py-3">
                  <Badge tone={SEVERITY_TONE[r.severity] ?? "neutral"} variant="soft" className="capitalize">{r.severity}</Badge>
                </td>
                <td className="px-4 py-3 text-gray-500">{r.pinCode}</td>
                <td className="px-4 py-3">
                  <Badge tone={STATUS_TONE[r.status] ?? "neutral"} variant="soft" className="capitalize">{r.status}</Badge>
                </td>
                <td className="px-4 py-3 text-gray-600">{r.author.name}</td>
                <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  {r.status === "pending" && (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        onClick={() => run(r.id, resolveIncidentReport)}
                        disabled={loadingId === r.id}
                        className="text-xs"
                      >Resolve</Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => run(r.id, rejectIncidentReport)}
                        disabled={loadingId === r.id}
                        className="text-xs"
                      >Reject</Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} pageCount={pages} onPageChange={p => push("page", String(p))} />
    </div>
  );
}
