"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input, Select, Pagination, Badge, Button } from "@/components/ui";
import type { AdminClassified } from "@/lib/admin-platform";
import { removeClassified, approveClassified } from "@/app/admin/classifieds/actions";

const STATUS_TONES: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  active: "success", flagged: "danger", expired: "neutral", pending: "warning",
};

function fmt(p: number | null) {
  if (p === null) return "—";
  return `₹${(p / 100).toLocaleString("en-IN")}`;
}

function exportCSV(classifieds: AdminClassified[]) {
  const rows = [
    ["ID", "Title", "Category", "Price", "Status", "Seller", "City", "Pin", "Created"],
    ...classifieds.map(c => [c.id, c.title, c.category, fmt(c.price), c.status, c.sellerName, c.city, c.pinCode, c.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })]),
  ];
  const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = "classifieds.csv"; a.click();
}

export default function ClassifiedsTable({
  classifieds, total, pages, page, search, status, category,
}: {
  classifieds: AdminClassified[]; total: number; pages: number; page: number;
  search: string; status: string; category: string;
}) {
  const router      = useRouter();
  const sp          = useSearchParams();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  function push(key: string, val: string) {
    const p = new URLSearchParams(sp.toString());
    if (val) p.set(key, val); else p.delete(key);
    p.delete("page");
    router.push(`/admin/classifieds?${p}`);
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
        <Input placeholder="Search title or seller…" defaultValue={search} className="w-48"
          onChange={e => push("search", e.target.value)} />
        <Select value={status} onChange={e => push("status", e.target.value)} className="w-36">
          <option value="">All statuses</option>
          {["active","reserved","sold","expired","removed"].map(s => <option key={s} value={s}>{s}</option>)}
        </Select>
        <Select value={category} onChange={e => push("category", e.target.value)} className="w-36">
          <option value="">All categories</option>
          {["furniture","electronics","services","kids","vehicles","food"].map(c => <option key={c} value={c}>{c}</option>)}
        </Select>
        <Button variant="outline" size="sm" onClick={() => exportCSV(classifieds)}>Export CSV</Button>
        <span className="ml-auto self-center text-sm text-gray-500">{total} listings</span>
      </div>

      <div className="overflow-x-auto rounded-[6px] border border-border bg-surface">
        <table className="min-w-full text-sm">
          <thead className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              {["Title","Category","Price","Status","Seller","City","Posted","Actions"].map(h => (
                <th key={h} className="whitespace-nowrap px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {classifieds.length === 0 ? (
              <tr><td colSpan={8} className="py-12 text-center text-gray-400">No classifieds found.</td></tr>
            ) : classifieds.map(c => (
              <tr key={c.id} className="hover:bg-surface-muted/50">
                <td className="px-4 py-3 font-medium text-gray-900 max-w-[180px] truncate">{c.title}</td>
                <td className="px-4 py-3 capitalize text-gray-600">{c.category}</td>
                <td className="px-4 py-3 text-gray-700">{fmt(c.price)}</td>
                <td className="px-4 py-3">
                  <Badge tone={STATUS_TONES[c.status] ?? "neutral"} variant="soft" size="sm" className="capitalize">{c.status}</Badge>
                </td>
                <td className="px-4 py-3 text-gray-600">{c.sellerName}</td>
                <td className="px-4 py-3 text-gray-500">{c.city}</td>
                <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {c.status === "flagged" && (
                      <Button size="sm" onClick={() => run(c.id, approveClassified)}
                        disabled={loadingId === c.id} className="text-xs">Restore</Button>
                    )}
                    <Button size="sm" variant="destructive" onClick={() => run(c.id, removeClassified)}
                      disabled={loadingId === c.id} className="text-xs">Remove</Button>
                  </div>
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
