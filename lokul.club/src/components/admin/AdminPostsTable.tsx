"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition, useState } from "react";
import { FileText } from "lucide-react";
import { Badge, Button, EmptyState, Input, Pagination, Select } from "@/components/ui";

type PostRow = {
  id: string;
  type: string;
  body: string;
  status: string;
  pinCode: string | null;
  reactionCount: number;
  commentCount: number;
  viewCount: number;
  createdAt: string;
  author: { id: string; name: string };
  _count: { reactions: number; comments: number };
};

const STATUS_TONE: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  active:   "success",
  removed:  "danger",
  hidden:   "warning",
  reported: "warning",
};

const TYPE_LABELS: Record<string, string> = {
  update:     "Update",
  safety:     "Safety",
  lost:       "Lost & Found",
  event:      "Event",
  poll:       "Poll",
  sell:       "Sell",
  rwa_notice: "RWA Notice",
  sos:        "SOS",
};

export default function AdminPostsTable({
  posts, total, pages, page, status, type, search,
}: {
  posts:  PostRow[];
  total:  number;
  pages:  number;
  page:   number;
  status: string;
  type:   string;
  search: string;
}) {
  const router   = useRouter();
  const pathname = usePathname();
  const params   = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [q, setQ] = useState(search);

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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search posts…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && push({ search: q, page: 1 })}
          className="w-64"
        />
        <Select defaultValue={type} onChange={(e) => push({ type: e.target.value, page: 1 })}>
          <option value="">All types</option>
          {Object.entries(TYPE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </Select>
        <Select defaultValue={status} onChange={(e) => push({ status: e.target.value, page: 1 })}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="hidden">Hidden</option>
          <option value="removed">Removed</option>
        </Select>
        {(type || status || search) && (
          <Button size="xs" variant="ghost" onClick={() => push({ type: undefined, status: undefined, search: undefined, page: 1 })}>
            Clear
          </Button>
        )}
      </div>

      <p className="text-xs text-gray-400">
        {total.toLocaleString()} posts{isPending && " · Loading…"}
      </p>

      <div className="overflow-x-auto rounded-[6px] border border-border bg-surface shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3 text-left">Author</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Content</th>
              <th className="px-4 py-3 text-left">PIN</th>
              <th className="px-4 py-3 text-right">Reactions</th>
              <th className="px-4 py-3 text-right">Comments</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Posted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {posts.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10">
                  <EmptyState icon={<FileText size={28} />} title="No posts" description="No posts match your filters." />
                </td>
              </tr>
            ) : (
              posts.map((p) => (
                <tr key={p.id} className="hover:bg-surface-muted">
                  <td className="px-4 py-3 font-medium">{p.author.name}</td>
                  <td className="px-4 py-3">
                    <Badge tone="neutral" variant="soft" size="sm">
                      {TYPE_LABELS[p.type] ?? p.type}
                    </Badge>
                  </td>
                  <td className="max-w-xs px-4 py-3 text-gray-600">
                    <span className="line-clamp-2 block">{p.body}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.pinCode ?? "—"}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{p.reactionCount}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{p.commentCount}</td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONE[p.status] ?? "neutral"} variant="soft" size="sm" className="capitalize">
                      {p.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
                  </td>
                </tr>
              ))
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
