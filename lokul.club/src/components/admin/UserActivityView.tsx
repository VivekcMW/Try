"use client";

import type { UserActivity } from "@/lib/admin-platform";
import { Badge } from "@/components/ui";

function fmt(paise: number) {
  const sign = paise < 0 ? "-" : "+";
  return `${sign}₹${(Math.abs(paise) / 100).toLocaleString("en-IN")}`;
}

const STATUS_TONES: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  completed: "success", pending: "warning", cancelled: "danger", open: "neutral",
};

export default function UserActivityView({ userId, activity }: { userId: string; activity: UserActivity }) {
  const { orders, walletEntries, posts, kycDocs } = activity;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Orders */}
      <Section title={`Orders (${orders.length})`}>
        {orders.length === 0 ? <Empty /> : orders.map(o => (
          <Row key={o.id}>
            <span className="font-mono text-xs text-gray-400">{o.id}</span>
            <Badge tone={STATUS_TONES[o.status] ?? "neutral"} variant="soft" className="capitalize text-xs">{o.status}</Badge>
            <span className="ml-auto font-mono text-xs text-gray-700">₹{(o.pricePaise/100).toLocaleString("en-IN")}</span>
            <span className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</span>
          </Row>
        ))}
      </Section>

      {/* Wallet */}
      <Section title={`Wallet (${walletEntries.length})`}>
        {walletEntries.length === 0 ? <Empty /> : walletEntries.map(e => (
          <Row key={e.id}>
            <span className="capitalize text-xs text-gray-600">{e.type}</span>
            <span className="max-w-[140px] truncate text-xs text-gray-500">{e.description}</span>
            <span className={`ml-auto font-mono text-xs font-semibold ${e.amountPaise < 0 ? "text-red-600" : "text-green-600"}`}>
              {fmt(e.amountPaise)}
            </span>
            <span className="text-xs text-gray-400">{new Date(e.createdAt).toLocaleDateString()}</span>
          </Row>
        ))}
      </Section>

      {/* Posts */}
      <Section title={`Posts (${posts.length})`}>
        {posts.length === 0 ? <Empty /> : posts.map(p => (
          <Row key={p.id}>
            <span className="max-w-[220px] truncate text-xs text-gray-700">{p.body}</span>
            <span className="ml-auto text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</span>
          </Row>
        ))}
      </Section>

      {/* KYC */}
      <Section title={`KYC Documents (${kycDocs.length})`}>
        {kycDocs.length === 0 ? <Empty /> : kycDocs.map(d => (
          <Row key={d.id}>
            <span className="capitalize text-xs text-gray-700">{d.docType.replace(/_/g, " ")}</span>
            <Badge tone={STATUS_TONES[d.status] ?? "neutral"} variant="soft" className="capitalize text-xs">{d.status}</Badge>
            <span className="ml-auto text-xs text-gray-400">{new Date(d.createdAt).toLocaleDateString()}</span>
          </Row>
        ))}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[6px] border border-border bg-surface">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="divide-y divide-border">{children}</div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2 px-4 py-2.5">{children}</div>;
}

function Empty() {
  return <p className="px-4 py-6 text-center text-xs text-gray-400">No data.</p>;
}
