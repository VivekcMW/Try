"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input, Pagination, Button } from "@/components/ui";
import type { AdminMedicalProfile } from "@/lib/admin-platform";

function exportCSV(rows: AdminMedicalProfile[]) {
  const data = [
    ["ID", "User", "Phone", "Blood Group", "Allergies", "Conditions", "Medications", "Doctor Phone", "Updated"],
    ...rows.map(m => [
      m.id, m.user.name, m.user.phone,
      m.bloodGroup ?? "",
      m.allergies.join("; "),
      m.conditions.join("; "),
      m.medications.join("; "),
      m.doctorPhone ?? "",
      new Date(m.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    ]),
  ];
  const csv = data.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = "medical-profiles.csv";
  a.click();
}

export default function MedicalProfilesTable({
  profiles, total, pages, page, search,
}: {
  profiles: AdminMedicalProfile[]; total: number; pages: number; page: number; search: string;
}) {
  const router = useRouter();
  const sp = useSearchParams();

  function push(key: string, val: string) {
    const p = new URLSearchParams(sp.toString());
    if (val) p.set(key, val); else p.delete(key);
    p.delete("page");
    router.push(`/admin/medical-profiles?${p}`);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Search name or blood group…"
          defaultValue={search}
          className="w-56"
          onChange={e => push("search", e.target.value)}
        />
        <Button variant="outline" size="sm" onClick={() => exportCSV(profiles)}>Export CSV</Button>
        <span className="ml-auto self-center text-sm text-gray-500">{total} profiles</span>
      </div>

      <div className="overflow-x-auto rounded-[6px] border border-border bg-surface">
        <table className="min-w-full text-sm">
          <thead className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              {["User", "Phone", "Blood Group", "Allergies", "Conditions", "Medications", "Doctor Phone", "Updated"].map(h => (
                <th key={h} className="whitespace-nowrap px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {profiles.length === 0 ? (
              <tr><td colSpan={8} className="py-12 text-center text-gray-400">No medical profiles found.</td></tr>
            ) : profiles.map(m => (
              <tr key={m.id} className="hover:bg-surface-muted/50">
                <td className="px-4 py-3 font-medium text-gray-900">{m.user.name}</td>
                <td className="px-4 py-3 text-gray-500">{m.user.phone}</td>
                <td className="px-4 py-3">
                  {m.bloodGroup
                    ? <span className="rounded-[6px] bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">{m.bloodGroup}</span>
                    : <span className="text-gray-300">—</span>
                  }
                </td>
                <td className="px-4 py-3 text-gray-600 max-w-[140px] truncate" title={m.allergies.join(", ")}>{m.allergies.join(", ") || "—"}</td>
                <td className="px-4 py-3 text-gray-600 max-w-[140px] truncate" title={m.conditions.join(", ")}>{m.conditions.join(", ") || "—"}</td>
                <td className="px-4 py-3 text-gray-600 max-w-[140px] truncate" title={m.medications.join(", ")}>{m.medications.join(", ") || "—"}</td>
                <td className="px-4 py-3 text-gray-500">{m.doctorPhone ?? "—"}</td>
                <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{new Date(m.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} pageCount={pages} onPageChange={p => push("page", String(p))} />
    </div>
  );
}
