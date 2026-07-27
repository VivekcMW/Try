"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input, Select, Pagination, Badge, Button } from "@/components/ui";
import type { AdminWalletEntry } from "@/lib/admin-platform";
import { freezeWalletEntry, releaseWalletEntry } from "@/app/admin/wallet/actions";

const STATUS_TONES: Record<string, "success" | "warning" | "danger" | "neutral" | "info"> = {
  completed: "success", pending: "warning", held: "info", failed: "danger",
};

function fmt(paise: number) {
  const sign = paise < 0 ? "-" : "+";
  return `${sign}₹${(Math.abs(paise) / 100).toLocaleString("en-IN")}`;
}

function exportCSV(entries: AdminWalletEntry[]) {
  const rows = [
    ["ID","User","Type","Amount","Description","Status","Reference","Created"],
    ...entries.map(e => [e.id, e.userName, e.type, fmt(e.amountPaise), e.description, e.status, e.reference ?? "", e.createdAt.toLocaleDateString()]),
  ];
  const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = "wallet-entries.csv"; a.click();
}

export default function WalletTable({
  entries, total, pages, page, search, type, status,
}: {
  entries: AdminWalletEntry[]; total: number; pages: number; page: number;
  search: string; type: string; status: string;
}) {
  const router = useRouter();
  const sp     = useSearchParams();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  function push(key: string, val: string) {
    const p = new URLSearchParams(sp.toString());
    if (val) p.set(key, val); else p.delete(key);
    p.delete("page");
    router.push(`/admin/wallet?${p}`);
  }

  async function run(id: string, fn: (id: string) => Promise<void>) {
    setLoadingId(id);
    await fn(id);
    setLoadingId(null);
    router.refresh();
  }

  const totalFloat = entries.reduce((s, e) => s + e.amountPaise, 0);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total entries", value: total },
          { label: "Wallet float (filtered)", value: `₹${(Math.abs(totalFloat) / 100).toLocaleString("en-IN")}` },
          { label: "Pending payouts", value: entries.filter(e => e.status === "pending").length },
          { label: "Held (escrow)", value: entries.filter(e => e.status === "held").length },
        ].map(s => (
          <div key={s.label} className="rounded-[6px] border border-border bg-surface p-4">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Input placeholder="Search user or reference…" defaultValue={search} className="w-48"
          onChange={e => push("search", e.target.value)} />
        <Select value={type} onChange={e => push("type", e.target.value)} className="w-32">
          <option value="">All types</option>
          {["topup","spend","earn","payout","refund","hold","release"].map(t => <option key={t} value={t}>{t}</option>)}
        </Select>
        <Select value={status} onChange={e => push("status", e.target.value)} className="w-36">
          <option value="">All statuses</option>
          {["pending","completed","failed","reversed"].map(s => <option key={s} value={s}>{s}</option>)}
        </Select>
        <Button variant="outline" size="sm" onClick={() => exportCSV(entries)}>Export CSV</Button>
      </div>

      <div className="overflow-x-auto rounded-[6px] border border-border bg-surface">
        <table className="min-w-full text-sm">
          <thead className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              {["User","Type","Amount","Description","Status","Reference","Date","Actions"].map(h => (
                <th key={h} className="whitespace-nowrap px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {entries.length === 0 ? (
              <tr><td colSpan={8} className="py-12 text-center text-gray-400">No transactions found.</td></tr>
            ) : entries.map(e => (
              <tr key={e.id} className="hover:bg-surface-muted/50">
                <td className="px-4 py-3 font-medium text-gray-900">{e.userName}</td>
                <td className="px-4 py-3 capitalize text-gray-600">{e.type}</td>
                <td className={`px-4 py-3 font-mono font-semibold ${e.amountPaise < 0 ? "text-red-600" : "text-green-600"}`}>
                  {fmt(e.amountPaise)}
                </td>
                <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{e.description}</td>
                <td className="px-4 py-3">
                  <Badge tone={STATUS_TONES[e.status] ?? "neutral"} variant="soft" className="capitalize">{e.status}</Badge>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-400">{e.reference ?? "—"}</td>
                <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{new Date(e.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  {e.status === "held" && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => run(e.id, releaseWalletEntry)}
                        disabled={loadingId === e.id} className="text-xs">Release</Button>
                      <Button size="sm" variant="destructive" onClick={() => run(e.id, freezeWalletEntry)}
                        disabled={loadingId === e.id} className="text-xs">Freeze</Button>
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
