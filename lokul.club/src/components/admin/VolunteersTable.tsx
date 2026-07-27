"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input, Select, Pagination, Badge, Button } from "@/components/ui";
import type { AdminVolunteer } from "@/lib/admin-platform";

function exportCSV(rows: AdminVolunteer[]) {
  const data = [
    ["ID", "User", "Phone", "Pin Code", "Skills", "Active", "Updated"],
    ...rows.map(v => [v.id, v.user.name, v.user.phone, v.pinCode, v.skills.join("; "), v.active ? "Yes" : "No", new Date(v.updatedAt).toLocaleDateString()]),
  ];
  const csv = data.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = "volunteers.csv";
  a.click();
}

export default function VolunteersTable({
  volunteers, total, pages, page, search, active,
}: {
  volunteers: AdminVolunteer[]; total: number; pages: number; page: number;
  search: string; active: string;
}) {
  const router = useRouter();
  const sp = useSearchParams();

  function push(key: string, val: string) {
    const p = new URLSearchParams(sp.toString());
    if (val) p.set(key, val); else p.delete(key);
    p.delete("page");
    router.push(`/admin/volunteers?${p}`);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Search name or pin…"
          defaultValue={search}
          className="w-52"
          onChange={e => push("search", e.target.value)}
        />
        <Select value={active} onChange={e => push("active", e.target.value)} className="w-32">
          <option value="">All</option>
          <option value="1">Active</option>
          <option value="0">Inactive</option>
        </Select>
        <Button variant="outline" size="sm" onClick={() => exportCSV(volunteers)}>Export CSV</Button>
        <span className="ml-auto self-center text-sm text-gray-500">{total} volunteers</span>
      </div>

      <div className="overflow-x-auto rounded-[6px] border border-border bg-surface">
        <table className="min-w-full text-sm">
          <thead className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              {["User", "Phone", "Pin Code", "Skills", "Status", "Last Updated"].map(h => (
                <th key={h} className="whitespace-nowrap px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {volunteers.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-gray-400">No volunteers found.</td></tr>
            ) : volunteers.map(v => (
              <tr key={v.id} className="hover:bg-surface-muted/50">
                <td className="px-4 py-3 font-medium text-gray-900">{v.user.name}</td>
                <td className="px-4 py-3 text-gray-500">{v.user.phone}</td>
                <td className="px-4 py-3 text-gray-600">{v.pinCode}</td>
                <td className="px-4 py-3 text-gray-600 max-w-[200px]">
                  <div className="flex flex-wrap gap-1">
                    {v.skills.map(s => (
                      <span key={s} className="rounded-[6px] bg-surface-muted px-2 py-0.5 text-xs text-gray-600 capitalize">{s}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={v.active ? "success" : "neutral"} variant="soft">{v.active ? "Active" : "Inactive"}</Badge>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{new Date(v.updatedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} pageCount={pages} onPageChange={p => push("page", String(p))} />
    </div>
  );
}
