"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition, useState } from "react";
import { CalendarDays } from "lucide-react";
import { cancelEvent, removeEvent } from "@/app/admin/events/actions";
import { Badge, Button, EmptyState, Input, Pagination, Select } from "@/components/ui";

type EventRow = {
  id: string;
  body: string;
  pinCode: string | null;
  createdAt: string;
  author: { id: string; name: string };
  rsvpYes:   number;
  rsvpMaybe: number;
  rsvpNo:    number;
  totalRsvps: number;
};

export default function AdminEventsTable({
  events, total, pages, page, search,
}: {
  events: EventRow[];
  total:  number;
  pages:  number;
  page:   number;
  search: string;
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search events…"
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
        {total.toLocaleString()} events{isPending && " · Loading…"}
      </p>

      <div className="overflow-x-auto rounded-[6px] border border-border bg-surface shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3 text-left">Organiser</th>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-left">PIN</th>
              <th className="px-4 py-3 text-right">Going</th>
              <th className="px-4 py-3 text-right">Maybe</th>
              <th className="px-4 py-3 text-right">Not Going</th>
              <th className="px-4 py-3 text-right">Total RSVPs</th>
              <th className="px-4 py-3 text-left">Created</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {events.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10">
                  <EmptyState icon={<CalendarDays size={28} />} title="No events" description="No events match your search." />
                </td>
              </tr>
            ) : (
              events.map((e) => (
                <tr key={e.id} className="hover:bg-surface-muted">
                  <td className="px-4 py-3 font-medium">{e.author.name}</td>
                  <td className="max-w-sm px-4 py-3 text-gray-600">
                    <span className="line-clamp-2 block">{e.body}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{e.pinCode ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <Badge tone="success" variant="soft" size="sm">{e.rsvpYes}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Badge tone="warning" variant="soft" size="sm">{e.rsvpMaybe}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Badge tone="danger" variant="soft" size="sm">{e.rsvpNo}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-700">{e.totalRsvps}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(e.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => run(e.id, cancelEvent)} disabled={loadingId === e.id} className="text-xs">Cancel</Button>
                      <Button size="sm" variant="destructive" onClick={() => run(e.id, removeEvent)} disabled={loadingId === e.id} className="text-xs">Remove</Button>
                    </div>
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
