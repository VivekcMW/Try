"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition, useState } from "react";
import { MessageSquare } from "lucide-react";
import { Badge, Button, EmptyState, Input, Pagination, Select } from "@/components/ui";

type ChatThreadRow = {
  id: string;
  type: string;
  name: string | null;
  memberCount: number;
  messageCount: number;
  lastMessageAt: string | null;
  createdAt: string;
  creator: { id: string; name: string };
};

const TYPE_TONE: Record<string, "neutral" | "brand" | "success" | "warning"> = {
  direct:    "neutral",
  group:     "brand",
  community: "success",
  society:   "warning",
};

export default function AdminChatTable({
  threads, total, pages, page, type, search,
}: {
  threads: ChatThreadRow[];
  total:   number;
  pages:   number;
  page:    number;
  type:    string;
  search:  string;
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
          placeholder="Search threads…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && push({ search: q, page: 1 })}
          className="w-64"
        />
        <Select defaultValue={type} onChange={(e) => push({ type: e.target.value, page: 1 })}>
          <option value="">All types</option>
          <option value="dm">Direct</option>
          <option value="society_main">Society</option>
          <option value="tower">Tower</option>
          <option value="topic">Topic</option>
          <option value="community">Community</option>
        </Select>
        {(type || search) && (
          <Button size="xs" variant="ghost" onClick={() => push({ type: undefined, search: undefined, page: 1 })}>
            Clear
          </Button>
        )}
      </div>

      <p className="text-xs text-gray-400">
        {total.toLocaleString()} threads{isPending && " · Loading…"}
      </p>

      <div className="overflow-x-auto rounded-[6px] border border-border bg-surface shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3 text-left">Thread</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Creator</th>
              <th className="px-4 py-3 text-right">Members</th>
              <th className="px-4 py-3 text-right">Messages</th>
              <th className="px-4 py-3 text-left">Last Active</th>
              <th className="px-4 py-3 text-left">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {threads.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10">
                  <EmptyState icon={<MessageSquare size={28} />} title="No threads" description="No chat threads match your filters." />
                </td>
              </tr>
            ) : (
              threads.map((t) => (
                <tr key={t.id} className="hover:bg-surface-muted">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {t.name ?? <span className="italic text-gray-400">Unnamed</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={TYPE_TONE[t.type] ?? "neutral"} variant="soft" size="sm" className="capitalize">{t.type}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{t.creator.name}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{t.memberCount}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{t.messageCount}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {t.lastMessageAt
                      ? new Date(t.lastMessageAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(t.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
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
