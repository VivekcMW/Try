"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input, Pagination, Badge, Button } from "@/components/ui";
import type { AdminVouch } from "@/lib/admin-platform";
import { revokeVouch } from "@/app/admin/vouches/actions";

function exportCSV(vouches: AdminVouch[]) {
  const rows = [
    ["ID","Voucher","Subject","Note","Revoked","Date"],
    ...vouches.map(v => [v.id, v.voucherName, v.subjectName, v.note ?? "", v.isRevoked ? "Yes" : "No", v.createdAt.toLocaleDateString()]),
  ];
  const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = "vouches.csv"; a.click();
}

export default function VouchesTable({
  vouches, total, pages, page, search,
}: {
  vouches: AdminVouch[]; total: number; pages: number; page: number; search: string;
}) {
  const router = useRouter();
  const sp     = useSearchParams();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  function push(key: string, val: string) {
    const p = new URLSearchParams(sp.toString());
    if (val) p.set(key, val); else p.delete(key);
    p.delete("page");
    router.push(`/admin/vouches?${p}`);
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
        <Input placeholder="Search voucher or subject…" defaultValue={search} className="w-48"
          onChange={e => push("search", e.target.value)} />
        <Button variant="outline" size="sm" onClick={() => exportCSV(vouches)}>Export CSV</Button>
        <span className="ml-auto self-center text-sm text-gray-500">{total} vouches</span>
      </div>

      <div className="overflow-x-auto rounded-[6px] border border-border bg-surface">
        <table className="min-w-full text-sm">
          <thead className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              {["Voucher","Subject","Note","Status","Date","Actions"].map(h => (
                <th key={h} className="whitespace-nowrap px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {vouches.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-gray-400">No vouches found.</td></tr>
            ) : vouches.map(v => (
              <tr key={v.id} className="hover:bg-surface-muted/50">
                <td className="px-4 py-3 font-medium text-gray-900">{v.voucherName}</td>
                <td className="px-4 py-3 text-gray-600">{v.subjectName}</td>
                <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{v.note ?? "—"}</td>
                <td className="px-4 py-3">
                  <Badge tone={v.isRevoked ? "danger" : "success"} variant="soft">{v.isRevoked ? "Revoked" : "Active"}</Badge>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">{new Date(v.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  {!v.isRevoked && (
                    <Button size="sm" variant="destructive" onClick={() => run(v.id, revokeVouch)}
                      disabled={loadingId === v.id} className="text-xs">Revoke</Button>
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
