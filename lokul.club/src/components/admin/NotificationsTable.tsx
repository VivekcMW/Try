"use client";

type Notif = { id: string; title: string; body: string; recipientCount: number; sentAt: Date; channelType: string };

export default function NotificationsTable({ notifs }: { notifs: Notif[] }) {
  return (
    <div className="overflow-x-auto rounded-[6px] border border-border bg-surface">
      <table className="min-w-full text-sm">
        <thead className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-gray-500">
          <tr>
            {["Title","Message","Channel","Recipients","Sent At"].map(h => (
              <th key={h} className="whitespace-nowrap px-4 py-3 text-left">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {notifs.length === 0 ? (
            <tr><td colSpan={5} className="py-12 text-center text-gray-400">No notifications sent yet.</td></tr>
          ) : notifs.map(n => (
            <tr key={n.id} className="hover:bg-surface-muted/50">
              <td className="px-4 py-3 font-medium text-gray-900">{n.title}</td>
              <td className="px-4 py-3 text-gray-600 max-w-[240px] truncate">{n.body}</td>
              <td className="px-4 py-3 capitalize text-gray-500">{n.channelType}</td>
              <td className="px-4 py-3 font-mono text-gray-700">{n.recipientCount.toLocaleString()}</td>
              <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{new Date(n.sentAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
