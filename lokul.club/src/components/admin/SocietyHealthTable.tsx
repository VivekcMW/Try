"use client";

import { Badge, Button } from "@/components/ui";
import type { SocietyHealth } from "@/lib/admin-platform";
import Link from "next/link";

function fmt(paise: number) { return `₹${(paise / 100).toLocaleString("en-IN")}`; }

export default function SocietyHealthTable({ societies }: { societies: SocietyHealth[] }) {
  return (
    <div className="overflow-x-auto rounded-[6px] border border-border bg-surface">
      <table className="min-w-full text-sm">
        <thead className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-gray-500">
          <tr>
            {["Society","City","Members","Active Users","Orders","GMV","Open Flags","Actions"].map(h => (
              <th key={h} className="whitespace-nowrap px-4 py-3 text-left">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {societies.length === 0 ? (
            <tr><td colSpan={8} className="py-12 text-center text-gray-400">No approved societies found.</td></tr>
          ) : societies.map(s => (
            <tr key={s.id} className="hover:bg-surface-muted/50">
              <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
              <td className="px-4 py-3 text-gray-500">{s.city}</td>
              <td className="px-4 py-3 text-gray-600">{s.memberCount}</td>
              <td className="px-4 py-3 text-gray-600">{s.activeUsers}</td>
              <td className="px-4 py-3 text-gray-600">{s.orderCount}</td>
              <td className="px-4 py-3 font-mono text-gray-700">{fmt(s.gmvPaise)}</td>
              <td className="px-4 py-3">
                {s.openFlags > 0
                  ? <Badge tone="danger" variant="soft" className="text-xs">{s.openFlags} flags</Badge>
                  : <Badge tone="success" variant="soft" className="text-xs">Clean</Badge>}
              </td>
              <td className="px-4 py-3">
                <Link href={`/admin/societies?search=${encodeURIComponent(s.name)}`}>
                  <Button size="sm" variant="outline" className="text-xs">View</Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
