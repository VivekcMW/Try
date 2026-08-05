"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input, Select, Pagination, Badge, Button } from "@/components/ui";
import type { AdminSafetyJourney } from "@/lib/admin-platform";

const STATUS_TONE: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  active: "success",
  completed: "neutral",
  overdue: "danger",
};

function exportCSV(rows: AdminSafetyJourney[]) {
  const data = [
    ["ID", "User", "Phone", "Destination", "Status", "Expected Arrival", "Last Check-in", "Interval (min)", "Created"],
    ...rows.map(j => [
      j.id, j.user.name, j.user.phone, j.destination, j.status,
      new Date(j.expectedArrival).toISOString(),
      j.lastCheckInAt ? new Date(j.lastCheckInAt).toISOString() : "",
      String(j.checkInIntervalMin),
      new Date(j.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    ]),
  ];
  const csv = data.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = "safety-journeys.csv";
  a.click();
}

export default function SafetyJourneysTable({
  journeys, total, pages, page, search, status,
}: {
  journeys: AdminSafetyJourney[]; total: number; pages: number; page: number;
  search: string; status: string;
}) {
  const router = useRouter();
  const sp = useSearchParams();

  function push(key: string, val: string) {
    const p = new URLSearchParams(sp.toString());
    if (val) p.set(key, val); else p.delete(key);
    p.delete("page");
    router.push(`/admin/safety-journeys?${p}`);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Search user or destination…"
          defaultValue={search}
          className="w-56"
          onChange={e => push("search", e.target.value)}
        />
        <Select value={status} onChange={e => push("status", e.target.value)} className="w-36">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="overdue">Overdue</option>
        </Select>
        <Button variant="outline" size="sm" onClick={() => exportCSV(journeys)}>Export CSV</Button>
        <span className="ml-auto self-center text-sm text-gray-500">{total} journeys</span>
      </div>

      <div className="overflow-x-auto rounded-[6px] border border-border bg-surface">
        <table className="min-w-full text-sm">
          <thead className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              {["User", "Destination", "Status", "Expected Arrival", "Last Check-in", "Interval", "Started"].map(h => (
                <th key={h} className="whitespace-nowrap px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {journeys.length === 0 ? (
              <tr><td colSpan={7} className="py-12 text-center text-gray-400">No journeys found.</td></tr>
            ) : journeys.map(j => (
              <tr key={j.id} className="hover:bg-surface-muted/50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{j.user.name}</p>
                  <p className="text-xs text-gray-400">{j.user.phone}</p>
                </td>
                <td className="px-4 py-3 text-gray-700 max-w-[160px] truncate">{j.destination}</td>
                <td className="px-4 py-3">
                  <Badge tone={STATUS_TONE[j.status] ?? "neutral"} variant="soft" className="capitalize">{j.status}</Badge>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{new Date(j.expectedArrival).toLocaleString()}</td>
                <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{j.lastCheckInAt ? new Date(j.lastCheckInAt).toLocaleString() : "—"}</td>
                <td className="px-4 py-3 text-gray-600">{j.checkInIntervalMin} min</td>
                <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{new Date(j.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} pageCount={pages} onPageChange={p => push("page", String(p))} />
    </div>
  );
}
