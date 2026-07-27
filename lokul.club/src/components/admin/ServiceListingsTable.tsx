"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input, Select, Pagination, Badge, Button } from "@/components/ui";
import type { AdminServiceListing } from "@/lib/admin-platform";
import { deactivateServiceListing, activateServiceListing } from "@/app/admin/service-listings/actions";

function fmt(paise: number) { return `₹${(paise / 100).toLocaleString("en-IN")}`; }

function exportCSV(listings: AdminServiceListing[]) {
  const rows = [
    ["ID","Title","Category","Price","Active","Provider","City","Pin","Created"],
    ...listings.map(l => [l.id, l.title, l.category, fmt(l.pricePaise), l.isActive ? "Yes" : "No", l.providerName, l.city, l.pinCode, l.createdAt.toLocaleDateString()]),
  ];
  const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = "service-listings.csv"; a.click();
}

export default function ServiceListingsTable({
  listings, total, pages, page, search, category,
}: {
  listings: AdminServiceListing[]; total: number; pages: number; page: number;
  search: string; category: string;
}) {
  const router = useRouter();
  const sp     = useSearchParams();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  function push(key: string, val: string) {
    const p = new URLSearchParams(sp.toString());
    if (val) p.set(key, val); else p.delete(key);
    p.delete("page");
    router.push(`/admin/service-listings?${p}`);
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
        <Input placeholder="Search title or provider…" defaultValue={search} className="w-48"
          onChange={e => push("search", e.target.value)} />
        <Select value={category} onChange={e => push("category", e.target.value)} className="w-36">
          <option value="">All categories</option>
          {["cook","rider","coach","tutor","beautician","caretaker","handyman","reseller"].map(c => <option key={c} value={c}>{c}</option>)}
        </Select>
        <Button variant="outline" size="sm" onClick={() => exportCSV(listings)}>Export CSV</Button>
        <span className="ml-auto self-center text-sm text-gray-500">{total} listings</span>
      </div>

      <div className="overflow-x-auto rounded-[6px] border border-border bg-surface">
        <table className="min-w-full text-sm">
          <thead className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              {["Title","Category","Price","Status","Provider","City","Posted","Actions"].map(h => (
                <th key={h} className="whitespace-nowrap px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {listings.length === 0 ? (
              <tr><td colSpan={8} className="py-12 text-center text-gray-400">No service listings found.</td></tr>
            ) : listings.map(l => (
              <tr key={l.id} className="hover:bg-surface-muted/50">
                <td className="px-4 py-3 font-medium text-gray-900 max-w-[180px] truncate">{l.title}</td>
                <td className="px-4 py-3 capitalize text-gray-600">{l.category}</td>
                <td className="px-4 py-3 text-gray-700">{fmt(l.pricePaise)}/hr</td>
                <td className="px-4 py-3">
                  <Badge tone={l.isActive ? "success" : "neutral"} variant="soft">{l.isActive ? "Active" : "Inactive"}</Badge>
                </td>
                <td className="px-4 py-3 text-gray-600">{l.providerName}</td>
                <td className="px-4 py-3 text-gray-500">{l.city}</td>
                <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{new Date(l.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  {l.isActive
                    ? <Button size="sm" variant="destructive" onClick={() => run(l.id, deactivateServiceListing)}
                        disabled={loadingId === l.id} className="text-xs">Deactivate</Button>
                    : <Button size="sm" onClick={() => run(l.id, activateServiceListing)}
                        disabled={loadingId === l.id} className="text-xs">Activate</Button>
                  }
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
