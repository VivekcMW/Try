"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition, useState } from "react";
import { Megaphone } from "lucide-react";
import { Button, EmptyState, Input, Pagination } from "@/components/ui";

type MerchantBroadcastRow = {
  id: string; title: string; message: string; sentTo: number; createdAt: string;
  merchant: { id: string; name: string };
};

export default function MerchantBroadcastsTable({
  broadcasts, total, pages, page, search,
}: {
  broadcasts: MerchantBroadcastRow[];
  total:      number;
  pages:      number;
  page:       number;
  search:     string;
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
          placeholder="Search title or merchant…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && push({ search: q, page: 1 })}
          className="w-72"
        />
        {search && (
          <Button size="xs" variant="ghost" onClick={() => push({ search: undefined, page: 1 })}>
            Clear
          </Button>
        )}
      </div>

      <p className="text-xs text-gray-400">
        {total.toLocaleString()} broadcast{total !== 1 ? "s" : ""} sent by merchants to their customers
        {isPending && " · Loading…"}
      </p>

      <div className="overflow-x-auto rounded-[6px] border border-border bg-surface shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3 text-left">Merchant</th>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-right">Sent to</th>
              <th className="px-4 py-3 text-left">Sent at</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {broadcasts.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10">
                  <EmptyState
                    icon={<Megaphone size={28} />}
                    title="No merchant broadcasts"
                    description="No broadcasts match your filter. Toggle the merchant_broadcasts flag in Feature Flags to pause this channel."
                  />
                </td>
              </tr>
            ) : (
              broadcasts.map((b) => (
                <tr key={b.id} className="hover:bg-surface-muted">
                  <td className="px-4 py-3 font-medium">{b.merchant.name}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{b.title}</p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-gray-400">{b.message}</p>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">{b.sentTo.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(b.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <Pagination page={page} pageCount={pages} onPageChange={(n: number) => push({ page: n })} />
      )}
    </div>
  );
}
