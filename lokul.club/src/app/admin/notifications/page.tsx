import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import NotificationsTable from "@/components/admin/NotificationsTable";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Notifications | Lokul Admin" };

const noRealDb = (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");
const E2E = process.env.E2E_TEST === "1" || noRealDb;

const FIXTURE_NOTIFS = [
  { id: "n1", title: "Welcome!",         body: "You've been approved.",       recipientCount: 128, sentAt: new Date("2026-05-27T10:00:00Z"), channelType: "push" },
  { id: "n2", title: "Weekly digest",    body: "Here's what's happening...",  recipientCount: 540, sentAt: new Date("2026-05-24T08:00:00Z"), channelType: "email" },
  { id: "n3", title: "Safety reminder",  body: "Lock your vehicles at night.", recipientCount: 56,  sentAt: new Date("2026-05-26T20:00:00Z"), channelType: "push" },
];

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") redirect("/admin/login");

  let notifs = FIXTURE_NOTIFS as typeof FIXTURE_NOTIFS;
  if (!E2E) {
    const raw = await prisma.broadcast.findMany({
      where: { status: "sent" },
      orderBy: { sentAt: "desc" },
      take: 50,
      select: { id: true, title: true, body: true, recipientCount: true, sentAt: true, targetScope: true },
    });
    notifs = raw.map(b => ({
      id: b.id,
      title: b.title,
      body: b.body,
      recipientCount: b.recipientCount ?? 0,
      sentAt: b.sentAt ?? new Date(),
      channelType: b.targetScope ?? "push",
    }));
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Notifications Digest" description="Sent push and email notification history." />
      <NotificationsTable notifs={notifs} />
    </div>
  );
}
