"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Search, Download, Users } from "lucide-react";
import { Badge, Button, EmptyState, Input, Pagination, Select } from "@/components/ui";

const ROLE_LABELS: Record<string, string> = {
  resident: "Resident",
  merchant: "Merchant",
  rwa:      "RWA",
};
const ROLE_TONES: Record<string, "brand" | "accent" | "success" | "neutral"> = {
  resident: "brand",
  merchant: "accent",
  rwa:      "success",
};

type Entry = {
  id: string;
  name: string;
  email: string;
  pincode: string;
  role: string;
  notify: boolean;
  createdAt: Date;
};

export default function EntriesTable({
  entries,
  total,
  pages,
  page,
  search,
  role,
}: {
  entries: Entry[];
  total:   number;
  pages:   number;
  page:    number;
  search:  string;
  role:    string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params   = useSearchParams();
  const [isPending, startTransition] = useTransition();

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
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          {/* Search */}
          <div className="flex-1 max-w-xs">
            <Input
              defaultValue={search}
              placeholder="Search name, email, pin…"
              leftIcon={<Search size={14} />}
              onChange={(e) => push({ search: e.target.value, page: 1 })}
            />
          </div>

          {/* Role filter */}
          <Select
            defaultValue={role}
            onChange={(e) => push({ role: e.target.value, page: 1 })}
          >
            <option value="">All roles</option>
            <option value="resident">Residents</option>
            <option value="merchant">Merchants</option>
            <option value="rwa">RWAs</option>
          </Select>
        </div>

        {/* Export */}
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Download size={14} />}
          onClick={() => { window.location.href = "/api/admin/export"; }}
        >
          Export CSV
        </Button>
      </div>

      {/* Summary */}
      <p className="text-xs text-gray-400">
        {total.toLocaleString()} {total === 1 ? "entry" : "entries"}
        {(search || role) ? " matching filters" : " total"}
        {isPending && " · Loading…"}
      </p>

      {/* Table */}
      <div className="overflow-x-auto rounded-[6px] border border-border bg-surface shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Pin code</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Notify</th>
              <th className="px-4 py-3 text-left">Signed up</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10">
                  <EmptyState
                    icon={<Users size={28} />}
                    title="No entries found"
                    description={(search || role) ? "Try adjusting your filters." : "No waitlist entries yet."}
                  />
                </td>
              </tr>
            ) : (
              entries.map((e) => (
                <tr key={e.id} className="transition-colors hover:bg-surface-muted">
                  <td className="px-4 py-3 font-medium text-foreground">{e.name}</td>
                  <td className="px-4 py-3 text-gray-500">{e.email}</td>
                  <td className="px-4 py-3 font-mono text-gray-600">{e.pincode}</td>
                  <td className="px-4 py-3">
                    <Badge tone={ROLE_TONES[e.role] ?? "neutral"} variant="soft">
                      {ROLE_LABELS[e.role] ?? e.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={e.notify ? "success" : "neutral"} variant="soft">
                      {e.notify ? "Yes" : "No"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(e.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Page {page} of {pages}</span>
          <Pagination
            page={page}
            pageCount={pages}
            onPageChange={(p) => push({ page: p })}
          />
        </div>
      )}
    </div>
  );
}

