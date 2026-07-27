"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition, useState } from "react";
import { CalendarCheck } from "lucide-react";
import { Badge, Button, EmptyState, Input, Pagination, Select } from "@/components/ui";

type AppointmentRow = {
  id: string;
  status: string;
  serviceLabel: string;
  scheduledAt: string;
  createdAt: string;
  user: { id: string; name: string; phone: string };
  merchant: { id: string; name: string };
};

const STATUS_OPTIONS = [
  { value: "",           label: "All Statuses" },
  { value: "pending",    label: "Pending" },
  { value: "confirmed",  label: "Confirmed" },
  { value: "completed",  label: "Completed" },
  { value: "cancelled",  label: "Cancelled" },
];

function statusTone(s: string): "neutral" | "success" | "warning" | "danger" {
  if (s === "confirmed" || s === "completed") return "success";
  if (s === "pending") return "warning";
  if (s === "cancelled") return "danger";
  return "neutral";
}

export default function AdminAppointmentsTable({
  appointments, total, pages, page, search, status,
}: {
  appointments: AppointmentRow[];
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
        {total.toLocaleString()} appointment{total !== 1 ? "s" : ""}
        {isPending && " · Loading…"}
      </p>

      <div className="overflow-x-auto rounded-[6px] border border-border bg-surface shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-left">Merchant</th>
              <th className="px-4 py-3 text-left">Service</th>
              <th className="px-4 py-3 text-left">Scheduled</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Booked At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {appointments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10">
                  <EmptyState
                    icon={<CalendarCheck size={28} />}
                    title="No appointments"
                    description="No appointments match your filter."
                  />
                </td>
              </tr>
            ) : (
              appointments.map((a) => (
                <tr key={a.id} className="hover:bg-surface-muted">
                  <td className="px-4 py-3">
                    <p className="font-medium">{a.user.name}</p>
                    <p className="text-xs text-gray-400">{a.user.phone}</p>
                  </td>
                  <td className="px-4 py-3 font-medium">{a.merchant.name}</td>
                  <td className="px-4 py-3 text-gray-600">{a.serviceLabel}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(a.scheduledAt).toLocaleString("en-IN", {
                      day: "numeric", month: "short", year: "2-digit",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={statusTone(a.status)} variant="soft" size="sm">
                      {a.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(a.createdAt).toLocaleDateString("en-IN", {
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
