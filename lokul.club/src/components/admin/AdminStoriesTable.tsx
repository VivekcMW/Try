"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition, useState } from "react";
import { Clapperboard } from "lucide-react";
import { removeStory } from "@/app/admin/stories/actions";
import { Badge, Button, EmptyState, Input, Pagination } from "@/components/ui";

type StoryRow = {
  id: string;
  kind: string;
  caption: string | null;
  pinCode: string;
  viewCount: number;
  expiresAt: string;
  createdAt: string;
  author: { id: string; name: string };
};

export default function AdminStoriesTable({
  stories, total, pages, page, search,
}: {
  stories: StoryRow[];
  total:   number;
  pages:   number;
  page:    number;
  search:  string;
}) {
  const router   = useRouter();
  const pathname = usePathname();
  const params   = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [q, setQ] = useState(search);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  async function run(id: string, fn: (id: string) => Promise<void>) {
    setLoadingId(id); await fn(id); setLoadingId(null); router.refresh();
  }

  const push = useCallback(
    (updates: Record<string, string | number | undefined>) => {
      const next = new URLSearchParams(params.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v === undefined || v === "") next.delete(k);
        else next.set(k, String(v));
      });
      startTransition(() => router.push(`${pathname}?${next}`));
    },
    [params, pathname, router]
  );

  const now = Date.now();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search by author…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && push({ search: q, page: 1 })}
          className="w-64"
        />
        {search && (
          <Button size="xs" variant="ghost" onClick={() => push({ search: undefined, page: 1 })}>
            Clear
          </Button>
        )}
      </div>

      <p className="text-xs text-gray-400">
        {total.toLocaleString()} stories{isPending && " · Loading…"}
      </p>

      <div className="overflow-x-auto rounded-[6px] border border-border bg-surface shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3 text-left">Author</th>
              <th className="px-4 py-3 text-left">Kind</th>
              <th className="px-4 py-3 text-left">Caption</th>
              <th className="px-4 py-3 text-left">PIN</th>
              <th className="px-4 py-3 text-right">Views</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Expires</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {stories.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10">
                  <EmptyState icon={<Clapperboard size={28} />} title="No stories" description="No stories match your search." />
                </td>
              </tr>
            ) : (
              stories.map((s) => {
                const expired = new Date(s.expiresAt).getTime() < now;
                return (
                  <tr key={s.id} className="hover:bg-surface-muted">
                    <td className="px-4 py-3 font-medium">{s.author.name}</td>
                    <td className="px-4 py-3">
                      <Badge tone="neutral" variant="soft" size="sm" className="capitalize">{s.kind}</Badge>
                    </td>
                    <td className="max-w-xs px-4 py-3 text-gray-500">
                      <span className="line-clamp-1 block">{s.caption ?? <em className="text-gray-300">No caption</em>}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{s.pinCode}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{s.viewCount}</td>
                    <td className="px-4 py-3">
                      <Badge tone={expired ? "neutral" : "success"} variant="soft" size="sm">
                        {expired ? "Expired" : "Live"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(s.expiresAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(s.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
                    </td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="destructive" onClick={() => run(s.id, removeStory)} disabled={loadingId === s.id} className="text-xs">Remove</Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <Pagination
          page={page}
          pageCount={pages}
          onPageChange={(n: number) => push({ page: n })}
        />
      )}
    </div>
  );
}
