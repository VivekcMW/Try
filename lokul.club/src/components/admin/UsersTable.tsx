"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { Search, Users } from "lucide-react";
import Link from "next/link";
import { Badge, Button, EmptyState, Input, Pagination, Select } from "@/components/ui";
import type { AdminUser } from "@/lib/admin-platform";
import { banUser, suspendUser, unsuspendUser } from "@/app/admin/users/actions";

const ROLE_LABELS: Record<string, string> = {
  resident: "Resident", merchant: "Merchant", rwa_admin: "RWA Admin",
  guard: "Guard", moderator: "Moderator", super_admin: "Super Admin",
};
const ROLE_TONES: Record<string, "brand" | "accent" | "success" | "neutral" | "warning"> = {
  resident: "brand", merchant: "accent", rwa_admin: "success",
  guard: "neutral", moderator: "warning", super_admin: "warning",
};
const STATUS_TONES: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  active: "success", warned: "warning", suspended: "danger", banned: "danger", deleted: "neutral",
};
const KYC_TONES: Record<string, "neutral" | "warning" | "success"> = {
  bronze: "neutral", silver: "warning", gold: "success",
};

function exportCSV(users: AdminUser[]) {
  const rows = [
    ["ID","Name","Phone","Role","Status","KYC","Trust","Strikes","Joined"],
    ...users.map(u => [u.id, u.name, u.phone, u.role, u.status, u.kycTier, String(u.trustScore), String(u.strikeCount), new Date(u.createdAt).toLocaleDateString()]),
  ];
  const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = "users.csv"; a.click();
}

export default function UsersTable({
  users, total, pages, page, search, role, status,
}: {
  users:  AdminUser[];
  total:  number;
  pages:  number;
  page:   number;
  search: string;
  role:   string;
  status: string;
}) {
  const router   = useRouter();
  const pathname = usePathname();
  const params   = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);

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
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="w-full max-w-xs">
            <Input
              defaultValue={search}
              placeholder="Search name, phone…"
              leftIcon={<Search size={14} />}
              onChange={(e) => push({ search: e.target.value, page: 1 })}
            />
          </div>

          <Select defaultValue={role} onChange={(e) => push({ role: e.target.value, page: 1 })}>
            <option value="">All roles</option>
            <option value="resident">Resident</option>
            <option value="merchant">Merchant</option>
            <option value="rwa_admin">RWA Admin</option>
            <option value="guard">Guard</option>
            <option value="moderator">Moderator</option>
          </Select>

          <Select defaultValue={status} onChange={(e) => push({ status: e.target.value, page: 1 })}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="warned">Warned</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={() => exportCSV(users)}>Export CSV</Button>
      </div>

      <p className="text-xs text-gray-400">
        {total.toLocaleString()} {total === 1 ? "user" : "users"}
        {(search || role || status) ? " matching filters" : " total"}
        {isPending && " · Loading…"}
      </p>

      {/* Table */}
      <div className="overflow-x-auto rounded-[6px] border border-border bg-surface shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">KYC</th>
              <th className="px-4 py-3 text-right">Trust</th>
              <th className="px-4 py-3 text-right">Strikes</th>
              <th className="px-4 py-3 text-left">Joined</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10">
                  <EmptyState
                    icon={<Users size={28} />}
                    title="No users found"
                    description={(search || role || status) ? "Try adjusting your filters." : "No users registered yet."}
                  />
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="transition-colors hover:bg-surface-muted">
                  <td className="px-4 py-3 font-medium text-foreground">{u.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{u.phone}</td>
                  <td className="px-4 py-3">
                    <Badge tone={ROLE_TONES[u.role] ?? "neutral"} variant="soft" size="sm">
                      {ROLE_LABELS[u.role] ?? u.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONES[u.status] ?? "neutral"} variant="soft" size="sm">
                      {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={KYC_TONES[u.kycTier] ?? "neutral"} variant="outline" size="sm">
                      {u.kycTier.charAt(0).toUpperCase() + u.kycTier.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-semibold ${u.trustScore >= 70 ? "text-success" : u.trustScore >= 40 ? "text-warning" : "text-danger"}`}>
                      {u.trustScore}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">{u.strikeCount}</td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <Link href={`/admin/users/${u.id}`}>
                        <Button size="sm" variant="outline" className="text-xs">Activity</Button>
                      </Link>
                      {u.status !== "banned" && (
                        <Button size="sm" variant="destructive" className="text-xs"
                          disabled={loadingId === u.id}
                          onClick={async () => { setLoadingId(u.id); await banUser(u.id); setLoadingId(null); router.refresh(); }}>
                          Ban
                        </Button>
                      )}
                      {u.status === "active" && (
                        <Button size="sm" variant="outline" className="text-xs"
                          disabled={loadingId === u.id}
                          onClick={async () => { setLoadingId(u.id); await suspendUser(u.id); setLoadingId(null); router.refresh(); }}>
                          Suspend
                        </Button>
                      )}
                      {u.status === "suspended" && (
                        <Button size="sm" variant="outline" className="text-xs"
                          disabled={loadingId === u.id}
                          onClick={async () => { setLoadingId(u.id); await unsuspendUser(u.id); setLoadingId(null); router.refresh(); }}>
                          Unsuspend
                        </Button>
                      )}
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
          onPageChange={(p) => push({ page: p })}
        />
      )}
    </div>
  );
}
