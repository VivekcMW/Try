"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { closePoll } from "@/app/admin/polls/actions";

type Poll = { id: string; question: string; authorName: string; societyName: string; votes: number; createdAt: Date };

export default function PollsTable({ polls }: { polls: Poll[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function run(id: string, fn: (id: string) => Promise<void>) {
    setLoadingId(id);
    await fn(id);
    setLoadingId(null);
  }

  return (
    <div className="overflow-x-auto rounded-[6px] border border-border bg-surface">
      <table className="min-w-full text-sm">
        <thead className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-gray-500">
          <tr>
            {["Question","Author","Society","Votes","Date","Actions"].map(h => (
              <th key={h} className="whitespace-nowrap px-4 py-3 text-left">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {polls.length === 0 ? (
            <tr><td colSpan={6} className="py-12 text-center text-gray-400">No polls found.</td></tr>
          ) : polls.map(p => (
            <tr key={p.id} className="hover:bg-surface-muted/50">
              <td className="px-4 py-3 font-medium text-gray-900 max-w-[240px] truncate">{p.question}</td>
              <td className="px-4 py-3 text-gray-600">{p.authorName}</td>
              <td className="px-4 py-3 text-gray-500">{p.societyName}</td>
              <td className="px-4 py-3 text-gray-600 font-mono">{p.votes}</td>
              <td className="px-4 py-3 text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</td>
              <td className="px-4 py-3">
                <Button size="sm" variant="destructive" onClick={() => run(p.id, closePoll)}
                  disabled={loadingId === p.id} className="text-xs">Close</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
