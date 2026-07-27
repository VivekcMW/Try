"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition, useState } from "react";
import { Car } from "lucide-react";
import { cancelTrip } from "@/app/admin/carpool/actions";
import { Badge, Button, EmptyState, Input, Pagination, Select } from "@/components/ui";

type CarpoolRow = {
  id: string;
  fromLabel: string;
  toLabel: string;
  departureAt: string;
  seatsTotal: number;
  seatsLeft: number;
  pricePaise: number;
  status: string;
  pinCode: string;
  createdAt: string;
  driver: { id: string; name: string };
  joinCount: number;
};

const STATUS_TONE: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  open:        "success",
  full:        "warning",
  in_progress: "brand" as never,
  completed:   "neutral",
  cancelled:   "danger",
};

export default function AdminCarpoolTable({
  trips, total, pages, page, status, search,
}: {
  trips:  CarpoolRow[];
  total:  number;
  pages:  number;
  page:   number;
  status: string;
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
          placeholder="Search by driver or route…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && push({ search: q, page: 1 })}
          className="w-64"
        />
        <Select defaultValue={status} onChange={(e) => push({ status: e.target.value, page: 1 })}>
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="full">Full</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </Select>
        {(status || search) && (
          <Button size="xs" variant="ghost" onClick={() => push({ status: undefined, search: undefined, page: 1 })}>
            Clear
          </Button>
        )}
      </div>

      <p className="text-xs text-gray-400">
        {total.toLocaleString()} trips{isPending && " · Loading…"}
      </p>

      <div className="overflow-x-auto rounded-[6px] border border-border bg-surface shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3 text-left">Driver</th>
              <th className="px-4 py-3 text-left">From → To</th>
              <th className="px-4 py-3 text-left">Departure</th>
              <th className="px-4 py-3 text-left">PIN</th>
              <th className="px-4 py-3 text-right">Seats</th>
              <th className="px-4 py-3 text-right">Joined</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {trips.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10">
                  <EmptyState icon={<Car size={28} />} title="No trips" description="No carpool trips match your filters." />
                </td>
              </tr>
            ) : (
              trips.map((t) => (
                <tr key={t.id} className="hover:bg-surface-muted">
                  <td className="px-4 py-3 font-medium">{t.driver.name}</td>
                  <td className="px-4 py-3 text-gray-600">
                    <span className="line-clamp-1 block max-w-[220px]">
                      {t.fromLabel} → {t.toLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(t.departureAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{t.pinCode}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{t.seatsLeft}/{t.seatsTotal}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{t.joinCount}</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-700">
                    {t.pricePaise === 0 ? "Free" : `₹${(t.pricePaise / 100).toFixed(0)}`}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONE[t.status] ?? "neutral"} variant="soft" size="sm" className="capitalize">
                      {t.status.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="destructive" onClick={() => run(t.id, cancelTrip)} disabled={loadingId === t.id} className="text-xs">Cancel</Button>
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
