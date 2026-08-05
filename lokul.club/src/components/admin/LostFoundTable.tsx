"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Select, Badge, Button } from "@/components/ui";
import { removeLostFoundPost } from "@/app/admin/lost-found/actions";

type Item = { id: string; authorName: string; body: string; postTag: string; pinCode: string; createdAt: Date };

export default function LostFoundTable({ items, tag }: { items: Item[]; tag: string }) {
  const router = useRouter();
  const sp     = useSearchParams();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  function push(key: string, val: string) {
    const p = new URLSearchParams(sp.toString());
    if (val) p.set(key, val); else p.delete(key);
    router.push(`/admin/lost-found?${p}`);
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
        <Select value={tag} onChange={e => push("tag", e.target.value)} className="w-32">
          <option value="">All tags</option>
          <option value="lost">Lost</option>
          <option value="found">Found</option>
        </Select>
        <span className="ml-auto self-center text-sm text-gray-500">{items.length} posts</span>
      </div>
      <div className="overflow-x-auto rounded-[6px] border border-border bg-surface">
        <table className="min-w-full text-sm">
          <thead className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              {["Author","Description","Tag","Pin","Date","Actions"].map(h => (
                <th key={h} className="whitespace-nowrap px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-gray-400">No lost & found posts.</td></tr>
            ) : items.map(i => (
              <tr key={i.id} className="hover:bg-surface-muted/50">
                <td className="px-4 py-3 font-medium text-gray-900">{i.authorName}</td>
                <td className="px-4 py-3 text-gray-700 max-w-[240px] truncate">{i.body}</td>
                <td className="px-4 py-3">
                  <Badge tone={i.postTag === "lost" ? "danger" : "success"} variant="soft" className="capitalize text-xs">{i.postTag}</Badge>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-400">{i.pinCode}</td>
                <td className="px-4 py-3 text-xs text-gray-400">{new Date(i.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                <td className="px-4 py-3">
                  <Button size="sm" variant="destructive" onClick={() => run(i.id, removeLostFoundPost)}
                    disabled={loadingId === i.id} className="text-xs">Remove</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
