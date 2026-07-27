"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input, Pagination, Badge, Button } from "@/components/ui";
import type { AdminRating } from "@/lib/admin-platform";
import { flagRating, removeRating } from "@/app/admin/ratings/actions";

const STARS = ["★★★★★","★★★★☆","★★★☆☆","★★☆☆☆","★☆☆☆☆"];

function exportCSV(ratings: AdminRating[]) {
  const rows = [
    ["ID","Score","Review","Reviewer","Subject","Flagged","Date"],
    ...ratings.map(r => [r.id, String(r.score), r.review ?? "", r.reviewerName, r.subjectName, r.isFlagged ? "Yes" : "No", r.createdAt.toLocaleDateString()]),
  ];
  const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = "ratings.csv"; a.click();
}

export default function RatingsTable({
  ratings, total, pages, page, search, flagged,
}: {
  ratings: AdminRating[]; total: number; pages: number; page: number;
  search: string; flagged: boolean;
}) {
  const router = useRouter();
  const sp     = useSearchParams();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  function push(key: string, val: string) {
    const p = new URLSearchParams(sp.toString());
    if (val) p.set(key, val); else p.delete(key);
    p.delete("page");
    router.push(`/admin/ratings?${p}`);
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
        <Input placeholder="Search reviewer or subject…" defaultValue={search} className="w-48"
          onChange={e => push("search", e.target.value)} />
        <Button variant={flagged ? "primary" : "outline"} size="sm"
          onClick={() => push("flagged", flagged ? "" : "1")}>
          {flagged ? "Show all" : "Flagged only"}
        </Button>
        <Button variant="outline" size="sm" onClick={() => exportCSV(ratings)}>Export CSV</Button>
        <span className="ml-auto self-center text-sm text-gray-500">{total} ratings</span>
      </div>

      <div className="overflow-x-auto rounded-[6px] border border-border bg-surface">
        <table className="min-w-full text-sm">
          <thead className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              {["Score","Review","Reviewer","Subject","Status","Date","Actions"].map(h => (
                <th key={h} className="whitespace-nowrap px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {ratings.length === 0 ? (
              <tr><td colSpan={7} className="py-12 text-center text-gray-400">No ratings found.</td></tr>
            ) : ratings.map(r => (
              <tr key={r.id} className="hover:bg-surface-muted/50">
                <td className="px-4 py-3 text-yellow-500">{STARS[5 - r.score] ?? "?"}</td>
                <td className="px-4 py-3 text-gray-700 max-w-[200px] truncate">{r.review ?? "—"}</td>
                <td className="px-4 py-3 text-gray-600">{r.reviewerName}</td>
                <td className="px-4 py-3 text-gray-600">{r.subjectName}</td>
                <td className="px-4 py-3">
                  {r.isFlagged
                    ? <Badge tone="danger" variant="soft" className="text-xs">Flagged</Badge>
                    : <Badge tone="success" variant="soft" className="text-xs">OK</Badge>}
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {!r.isFlagged && (
                      <Button size="sm" variant="outline" onClick={() => run(r.id, flagRating)}
                        disabled={loadingId === r.id} className="text-xs">Flag</Button>
                    )}
                    <Button size="sm" variant="destructive" onClick={() => run(r.id, removeRating)}
                      disabled={loadingId === r.id} className="text-xs">Remove</Button>
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
