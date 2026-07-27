"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input, Pagination, Button } from "@/components/ui";
import type { AdminSafetyContact } from "@/lib/admin-platform";

function exportCSV(rows: AdminSafetyContact[]) {
  const data = [
    ["ID", "Contact Name", "Phone", "Relation", "User", "User Phone", "Created"],
    ...rows.map(c => [c.id, c.name, c.phone, c.relation ?? "", c.user.name, c.user.phone, new Date(c.createdAt).toLocaleDateString()]),
  ];
  const csv = data.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = "safety-contacts.csv";
  a.click();
}

export default function SafetyContactsTable({
  contacts, total, pages, page, search,
}: {
  contacts: AdminSafetyContact[]; total: number; pages: number; page: number; search: string;
}) {
  const router = useRouter();
  const sp = useSearchParams();

  function push(key: string, val: string) {
    const p = new URLSearchParams(sp.toString());
    if (val) p.set(key, val); else p.delete(key);
    p.delete("page");
    router.push(`/admin/safety-contacts?${p}`);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Search name or user…"
          defaultValue={search}
          className="w-56"
          onChange={e => push("search", e.target.value)}
        />
        <Button variant="outline" size="sm" onClick={() => exportCSV(contacts)}>Export CSV</Button>
        <span className="ml-auto self-center text-sm text-gray-500">{total} contacts</span>
      </div>

      <div className="overflow-x-auto rounded-[6px] border border-border bg-surface">
        <table className="min-w-full text-sm">
          <thead className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              {["Contact Name", "Phone", "Relation", "Registered User", "User Phone", "Added"].map(h => (
                <th key={h} className="whitespace-nowrap px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {contacts.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-gray-400">No safety contacts found.</td></tr>
            ) : contacts.map(c => (
              <tr key={c.id} className="hover:bg-surface-muted/50">
                <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                <td className="px-4 py-3 text-gray-600">{c.phone}</td>
                <td className="px-4 py-3 capitalize text-gray-500">{c.relation ?? "—"}</td>
                <td className="px-4 py-3 text-gray-700">{c.user.name}</td>
                <td className="px-4 py-3 text-gray-500">{c.user.phone}</td>
                <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{new Date(c.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} pageCount={pages} onPageChange={p => push("page", String(p))} />
    </div>
  );
}
