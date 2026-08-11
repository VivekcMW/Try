"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition, useState } from "react";
import { Receipt } from "lucide-react";
import { Badge, Button, EmptyState, Input, Pagination, Select } from "@/components/ui";

type QuoteRow = {
  id: string;
  status: string;
  serviceDescription: string;
  budgetPaise: number | null;
  quotedPaise: number | null;
  createdAt: string;
  user: { id: string; name: string; phone: string | null };
  merchant: { id: string; name: string };
};

const STATUS_OPTIONS = [
  { value: "",         label: "All Statuses" },
  { value: "open",     label: "Open" },
  { value: "quoted",   label: "Quoted" },
  { value: "accepted", label: "Accepted" },
  { value: "declined", label: "Declined" },
];

function statusTone(s: string): "neutral" | "success" | "warning" | "danger" {
  if (s === "accepted") return "success";
  if (s === "open" || s === "quoted") return "warning";
  if (s === "declined") return "danger";
  return "neutral";
}

function paise(v: number | null): string {
  if (v == null) return "—";
  return `₹${(v / 100).toLocaleString("en-IN", { minimumFractionDigits: 0 })}`;
}

export default function AdminQuotesTable({
  quotes, total, pages, page, search, status,
}: {
  quotes:  QuoteRow[];
  total:   number;
  pages:   number;
  page:    number;
  search:  string;
  status:  string;
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
          placeholder="Search by customer or merchant…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && push({ search: q, page: 1 })}
          className="w-72"
        />
        <Select
          value={status}
          onChange={(e) => push({ status: e.target.value, page: 1 })}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
        {(search || status) && (
          <Button size="xs" variant="ghost" onClick={() => push({ search: undefined, status: undefined, page: 1 })}>
            Clear
          </Button>
        )}
      </div>

      <p className="text-xs text-gray-400">
        {total.toLocaleString()} quote request{total !== 1 ? "s" : ""}
        {isPending && " · Loading…"}
      </p>

      <div className="overflow-x-auto rounded-[6px] border border-border bg-surface shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-left">Merchant</th>
              <th className="px-4 py-3 text-left">Service</th>
              <th className="px-4 py-3 text-right">Budget</th>
              <th className="px-4 py-3 text-right">Quoted</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Requested</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {quotes.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10">
                  <EmptyState
                    icon={<Receipt size={28} />}
                    title="No quote requests"
                    description="No quote requests match your filter."
                  />
                </td>
              </tr>
            ) : (
              quotes.map((q) => (
                <tr key={q.id} className="hover:bg-surface-muted">
                  <td className="px-4 py-3">
                    <p className="font-medium">{q.user.name}</p>
                    <p className="text-xs text-gray-400">{q.user.phone}</p>
                  </td>
                  <td className="px-4 py-3 font-medium">{q.merchant.name}</td>
                  <td className="max-w-xs px-4 py-3 text-gray-600">
                    <span className="line-clamp-2 block">{q.serviceDescription}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs">{paise(q.budgetPaise)}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs">{paise(q.quotedPaise)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={statusTone(q.status)} variant="soft" size="sm">
                      {q.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(q.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "2-digit",
                    })}
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
